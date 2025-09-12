<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Client;
use App\Models\ProposalTemplate;
use App\Models\PredefinedProposal;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;
use App\Helpers\ProposalHelper;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendProposalLink;
use League\CommonMark\Environment\Environment;
use League\CommonMark\CommonMarkConverter;
use Illuminate\Support\Facades\DB;
use App\Services\UsageService;
use App\Jobs\GenerateProposalPdf;
use App\Jobs\SendProposalEmail;

use HTMLPurifier;
use HTMLPurifier_Config;


class ProposalController extends Controller
{
    public function indexxx(Request $request)
    {
        // $organizationId = session('current_organization_id');
        $organizationId = $request->user()->organization_id;

        return $request->user()->proposals()
            ->with('client') // Eager load client
            ->where('organization_id', $organizationId)
            ->get();
        // return $request->user()->proposals()->with('client')->get();
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Owner
        if ($user->organization_id) {
            $organizationId = $user->organization_id;
        } else {
            // Team member
            $organizationId = $user->organizations()->first()->id ?? null;
        }

        if (!$organizationId) {
            return response()->json(['error' => 'No organization found'], 400);
        }

        return $user->proposals()
            ->with('client')
            ->where('organization_id', $organizationId)
            ->get();
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'proposal_template_id' => 'nullable|exists:proposal_templates,id', // allow null
            'title' => 'required|string|max:255',
            'project_details' => 'nullable|string',
            'pricing' => 'nullable|numeric|min:0',
            'content' => 'nullable|string',
            'your_name' => 'nullable|string',
            'your_position' => 'nullable|string',
            'your_contact_info' => 'nullable|string',
            'your_company' => 'nullable|string',
            'client_address' => 'nullable|string',
            'client_city_state_zip' => 'nullable|string',

            'line_items' => 'nullable|array',
            'line_items.*.active' => 'nullable|boolean',
            // 'line_items.*.active' => 'required|boolean',
            'line_items.*.description' => 'nullable|string',
            'line_items.*.quantity' => 'nullable|numeric|min:0',
            'line_items.*.price' => 'nullable|numeric|min:0',
            'line_items.*.vat' => 'nullable|numeric|min:0',
            'line_items.*.discount' => 'nullable|numeric|min:0',
            // 'line_items' => 'nullable|array',
            // 'line_items.*.active' => 'required|boolean',
            // 'line_items.*.description' => 'sometimes|string|required_if_active',
            // 'line_items.*.quantity' => 'sometimes|numeric|min:0|required_if_active',
            // 'line_items.*.price' => 'sometimes|numeric|min:0|required_if_active',

            // 'line_items.*.vat' => 'nullable|numeric|min:0',
            // 'line_items.*.discount' => 'nullable|numeric|min:0',

        ]);
        $lineItems = $data['line_items'] ?? [];
        foreach ($lineItems as $i => $item) {
            if (!empty($item['active'])) {
                if (empty($item['description'])) {
                    return response()->json(['error' => "Line item #$i description is required"], 422);
                }
                if (!isset($item['quantity'])) {
                    return response()->json(['error' => "Line item #$i quantity is required"], 422);
                }
                if (!isset($item['price'])) {
                    return response()->json(['error' => "Line item #$i price is required"], 422);
                }
            }
        }    
        
        // Verify client belongs to current organization
        $organizationId = $request->input('organization_id') ?? session('current_organization_id');
        // $organization = $request->user()->organizations()->find($organizationId);

        $user = $request->user();

        // Check if main owner (single org)
        if ($user->organization_id === $organizationId) {
            $organization = $user->organization; // belongsTo relationship
        } else {
            // Check if team member
            $organization = $user->organizations()
                                 ->where('organizations.id', $organizationId)
                                 ->first();
        }

        if (!$organization) {
            return response()->json(['error' => 'No organization selected'], 400);
        }

        // $organizationId = session('current_organization_id');
        $client = $request->user()->clients()
            ->where('id', $data['client_id'])
            ->where('organization_id', $organizationId)
            ->firstOrFail();

        $data['organization_id'] = $organizationId;
        // if (!$organizationId) {
        //     return response()->json(['error' => 'No organization selected'], 400);
        // }

        // $client = Client::findOrFail($data['client_id']);
        if ($client->user_id !== $request->user()->id) {
            abort(403);
        }
    
        // Calculate total from line items
        $total = 0;
        if (!empty($data['line_items'])) {
            foreach ($data['line_items'] as $item) {
                $total += $item['quantity'] * $item['price'];
            }
        }

        // if ($data['proposal_template_id']) {
        //     $template = ProposalTemplate::where(function($q) use ($request) {
        //         $q->where('is_public', true)
        //           ->orWhere('user_id', $request->user()->id);
        //     })->findOrFail($data['proposal_template_id']);
        // }
        $template = ProposalTemplate::where(function($q) use ($request) {
            $q->where('is_public', true)
              ->orWhere('user_id', $request->user()->id);
        })
        ->findOrFail($data['proposal_template_id']);

        // Prepare content
        if ($template) {
            $placeholders = [
                'client_name' => $client->name,
                'client_company' => $client->company,
                'project_details' => $data['project_details'] ?? '',
                'pricing' => $data['pricing'] ?? '',

                //added
                'your_name' => $data['your_name'],
                'your_position' => $data['your_position'],
                'your_company_line' => $data['your_company_line'] ?? null,
                'your_contact_info' => $data['your_contact_info'],
            ];
    
            $content = View::make('templates.proposal_template', array_merge([
                'templateContent' => $template->content,
            ], $placeholders))->render();
        } else {
            // fallback: use provided content
            $content = $data['content'] ?? '';
        }
    
        $proposal = Proposal::create([
            'user_id' => $request->user()->id,
            'organization_id' => $organizationId,
            'client_id' => $client->id,
            'proposal_template_id' => $template->id ?? null,
            'title' => $data['title'],
            'content' => $content,
            'status' => 'draft',
            'secure_link_token' => Str::random(32),
    
            // Extra fields
            'project_details' => $data['project_details'] ?? null,
            'pricing' => $total, // Use calculated total
            'line_items' => $data['line_items'] ?? [],
            'your_name' => $data['your_name'] ?? null,
            'your_position' => $data['your_position'] ?? null,
            'your_contact_info' => $data['your_contact_info'] ?? null,
            'your_company' => $data['your_company'] ?? null,
            'client_address' => $data['client_address'] ?? null,
            'client_city_state_zip' => $data['client_city_state_zip'] ?? null,
        ]);
    
        // Increment usage count
        if ($request->user()->organization->subscription_type === 'free') {
            UsageService::incrementUsage($request->user()->organization, 'proposal');
        }
        return response()->json($proposal, 201);
    }

    public function show(Request $request, Proposal $proposal)
    {
        $this->authorizeProposal($request, $proposal);

        $signatureImage = null;
        if (!empty($proposal->signed_data['image_path'])) {
            $signatureFullPath = storage_path('app/public/' . $proposal->signed_data['image_path']);
            if (file_exists($signatureFullPath)) {
                $imageData = base64_encode(file_get_contents($signatureFullPath));
                $mimeType = mime_content_type($signatureFullPath);
                $signatureImage = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // Attach it so frontend can use it
        $proposal->signature_image = $signatureImage;
    
        // return $proposal;
        return response()->json($proposal);
    }

    public function update(Request $request, Proposal $proposal)
    {
        $this->authorizeProposal($request, $proposal);
    
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:draft,sent,viewed,approved,declined',
            'signature' => 'nullable|string',
    
            'project_details' => 'nullable|string',
            'content' => 'nullable|string',
            'your_name' => 'nullable|string',
            'your_position' => 'nullable|string',
            'your_company' => 'nullable|string',
            'your_contact_info' => 'nullable|string',
            'client_address' => 'nullable|string',
            'client_city_state_zip' => 'nullable|string',
    
            // Line items are optional, but if present and active, require fields
            'line_items' => 'nullable|array',
            'line_items.*.active' => 'required|boolean',
            'line_items.*.description' => 'required_if:line_items.*.active,1|string',
            'line_items.*.quantity' => 'required_if:line_items.*.active,1|numeric|min:0',
            'line_items.*.price' => 'required_if:line_items.*.active,1|numeric|min:0',
        ]);
    
        // Calculate total only from active items
        $total = 0;
        if (!empty($data['line_items'])) {
            foreach ($data['line_items'] as $item) {
                if (!empty($item['active'])) {
                    $total += ($item['quantity'] ?? 0) * ($item['price'] ?? 0);
                }
            }
        }
    
        // Update proposal
        $proposal->update(array_merge($data, [
            'pricing' => $total,
        ]));
    
        return response()->json($proposal);
    }
     
    public function destroy(Request $request, Proposal $proposal)
    {
        $this->authorizeProposal($request, $proposal);
        $proposal->delete();
        return response()->json(null, 204);
    }

    public function sendToClient(Proposal $proposal)
    {
        try {
            //if using dispatch job:
                // // Queue PDF generation
                // GenerateProposalPdf::dispatch($proposal);
                // // Queue email send
                // SendProposalEmail::dispatch($proposal);

            //if not using dispatch job
                $secureLink = url("/proposal/view/{$proposal->secure_link_token}");
                // Send email to client
                Mail::to($proposal->client->email)->send(new SendProposalLink($proposal, $secureLink));
                $proposal->update(['status' => 'sent']);

            return response()->json(['message' => 'Proposal link sent']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send email',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    
    // Secure link view for client (no auth)
    public function viewSecureX($token)
    {
        $proposal = Proposal::where('secure_link_token', $token)->firstOrFail();
    
        // 1. FIRST, REPLACE THE PLACEHOLDERS IN THE RAW CONTENT
        $content = $proposal->content;
        $replace = [
            '{{client_name}}' => $proposal->client->name,
            '{{client_company}}' => $proposal->client->company ?? '',
            '{{project_details}}' => $proposal->project_details ?? '',
            '{{pricing.total}}' => $proposal->pricing ?? 0,
            '{{your_name}}' => $proposal->your_name ?? '',
            '{{your_position}}' => $proposal->your_position ?? '',
            '{{your_contact_info}}' => $proposal->your_contact_info ?? '',
        ];
    
        foreach ($replace as $key => $val) {
            $content = str_replace($key, $val, $content);
        }
    
        // 2. CREATE A UNIQUE TEXT PLACEHOLDER (not HTML)
        $placeholder = '%%%HTML_TABLE_PLACEHOLDER%%%';
        
        // Extract the HTML table block and replace it with our text placeholder
        $htmlTable = '';
        $contentWithPlaceholder = preg_replace_callback(
            '/<table[^>]*>.*?<\/table>/s',
            function($matches) use (&$htmlTable, $placeholder) {
                $htmlTable = $matches[0];
                return $placeholder;
            },
            $content
        );
    
        // 3. CONVERT THE CONTENT (WITH TEXT PLACEHOLDER) TO HTML
        $converter = new CommonMarkConverter([
            'html_input' => 'strip', // This is fine now - it will leave our text placeholder alone
            'allow_unsafe_links' => false,
        ]);
        
        $htmlContent = $converter->convert($contentWithPlaceholder);
        $preparedContent = (string) $htmlContent;
    
        // 4. REPLACE THE TEXT PLACEHOLDER WITH THE ORIGINAL HTML TABLE
        $preparedContent = str_replace($placeholder, $htmlTable, $preparedContent);
    
        $signatureImage = null;
        if (!empty($proposal->signed_data['image_path'])) {
            $signatureFullPath = storage_path('app/public/' . $proposal->signed_data['image_path']);
            if (file_exists($signatureFullPath)) {
                $imageData = base64_encode(file_get_contents($signatureFullPath));
                $mimeType = mime_content_type($signatureFullPath);
                $signatureImage = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        $companyLogo = null;
        $user = $proposal->user;
        if ($user && $user->logo_path) {
            $logoFullPath = storage_path('app/public/' . $user->logo_path);
            if (file_exists($logoFullPath)) {
                $imageData = base64_encode(file_get_contents($logoFullPath));
                $mimeType = mime_content_type($logoFullPath);
                $companyLogo = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }

        return view('proposals.secure-view', [
            'proposal' => $proposal,
            'preparedContent' => $preparedContent,
            'signatureImage' => $signatureImage,
            'companyLogo' => $companyLogo,
        ]);
    }

    public function viewSecure($token)
    {
        $proposal = Proposal::where('secure_link_token', $token)->firstOrFail();
    
        // 1️⃣ Sanitize the template content
        $templateContent = $proposal->template->content ?? '';
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $cleanContent = $purifier->purify($templateContent);
    
        // 2️⃣ Replace standard placeholders
        $placeholders = [
            '{{client_name}}' => $proposal->client->name ?? '',
            '{{client_company}}' => $proposal->client->company ?? '',
            '{{project_details}}' => $proposal->project_details ?? '',
            '{{pricing.total}}' => $proposal->pricing ?? 0,
            '{{your_name}}' => $proposal->your_name ?? '',
            '{{your_position}}' => $proposal->your_position ?? '',
            '{{your_contact_info}}' => $proposal->your_contact_info ?? '',
        ];
        $contentWithPlaceholders = strtr($cleanContent, $placeholders);
    
        // 3️⃣ Handle line items / table safely
        $placeholder = '%%%HTML_TABLE_PLACEHOLDER%%%';
        $htmlTable = ProposalHelper::generateLineItemsTable($proposal); // keeps table HTML intact
        $contentWithToken = str_replace('{{line_items}}', $placeholder, $contentWithPlaceholders);
    
        // 4️⃣ Convert Markdown -> HTML (leaving placeholder alone)
        $converter = new CommonMarkConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
        $htmlContent = $converter->convert($contentWithToken);
    
        // 5️⃣ Put the table back
        $preparedContent = str_replace($placeholder, $htmlTable, (string)$htmlContent);
    
        // 6️⃣ Prepare signature image
        $signatureImage = null;
        if (!empty($proposal->signed_data['image_path'])) {
            $signatureFullPath = storage_path('app/public/' . $proposal->signed_data['image_path']);
            if (file_exists($signatureFullPath)) {
                $imageData = base64_encode(file_get_contents($signatureFullPath));
                $mimeType = mime_content_type($signatureFullPath);
                $signatureImage = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // 7️⃣ Prepare company logo
        $companyLogo = null;
        $user = $proposal->user;
        if ($user && $user->logo_path) {
            $logoFullPath = storage_path('app/public/' . $user->logo_path);
            if (file_exists($logoFullPath)) {
                $imageData = base64_encode(file_get_contents($logoFullPath));
                $mimeType = mime_content_type($logoFullPath);
                $companyLogo = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        return view('proposals.secure-view', [
            'proposal' => $proposal,
            'preparedContent' => $preparedContent,
            'signatureImage' => $signatureImage,
            'companyLogo' => $companyLogo,
        ]);
    }
    
    public function markViewed(Request $request)
    {
        $proposal = Proposal::where('view_token', $request->token)->firstOrFail();
        $proposal->increment('views');

        // Only update if not already viewed or accepted
        if ($proposal->status === 'sent' || $proposal->status === 'draft') {
            $proposal->update(['status' => 'viewed']);
        }
        return response()->json(['success' => true]);
    }

    public function acceptProposal(Request $request)
    {
        $proposal = Proposal::where('view_token', $request->token)->firstOrFail();
        
        if (!$proposal->accepted_at) {
            $proposal->accepted_count += 1;
            if ($proposal->status !== 'accepted') {
                $proposal->status = 'accepted';
            }
            $proposal->accepted_at = now();
            $proposal->save();
        }
            // Only process if not already accepted
        // if ($proposal->status !== 'accepted') {
            
        //     $proposal->update([
        //         'status' => 'accepted',
        //         'accepted_at' => now(),
        //         'signature' => $request->signature,
        //         'accepted_count' => $proposal->accepted_count + 1
        //     ]);
        // }
        return response()->json(['success' => true]);
    }

    // Client signs the proposal via secure link
    public function signProposal(Request $request, $token)
    {
        $proposal = Proposal::where('secure_link_token', $token)->firstOrFail();

        $data = $request->validate([
            'signer_name' => 'required|string|max:255',
            'signer_email' => 'required|email|max:255',
            'signature_image' => 'required|string',
            'accept_terms' => 'required|boolean',

            // 'signature' => 'required|string', // base64 image string
        ]);

        // $proposal->update([
        //     'signature' => $data['signature'],
        //     'status' => 'approved',
        // ]);
        $proposal->update([
            'signature' => $data['signature_image'],
            'status' => 'approved',
            'signed_ip' => $request->ip(),
            'signed_user_agent' => $request->userAgent(),
        ]);
        

        return response()->json(['message' => 'Proposal signed successfully']);
    }

    public function predefinedProposals() {
        return response()->json(PredefinedProposal::all());
    }
    
    public function sign(Request $request, Proposal $proposal)
    {
        $request->validate([

            'signature_image' => 'required|string',
            'accept_terms' => 'required|boolean',
        ]);

        $imageData = preg_replace('/^data:image\/png;base64,/', '', $request->signature_image);
        $imageData = str_replace(' ', '+', $imageData);

        $fileName = 'signature_'.$proposal->id.'_'.time().'.png';
        $filePath = storage_path('app/public/signatures/' . $fileName);

        if (!is_dir(storage_path('app/public/signatures'))) {
            mkdir(storage_path('app/public/signatures'), 0755, true);
        }

        file_put_contents($filePath, base64_decode($imageData));

        $proposal->signed_data = [
            'image_path' => 'signatures/' . $fileName,
            'signed_at' => now(),
            'your_name' => $proposal->your_name,
            
            'signed_ip' => $request->ip(),
            'signed_user_agent' => $request->userAgent(),
        ];

        $proposal->save();
        
        // Optional: regenerate PDF
        // $this->generatePdf($proposal);

        return response()->json(['message' => 'Signature saved successfully']);
    }

    private function authorizeProposal(Request $request, Proposal $proposal)
    {
        if ($proposal->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function generatePdfXX(Proposal $proposal)
    {
        $this->authorizeProposal(request(), $proposal);
    
        $folderPath = storage_path('app/public/proposals');
        if (!is_dir($folderPath)) mkdir($folderPath, 0755, true);
    
        $pdfPath = $folderPath . '/proposal_' . $proposal->id . '.pdf';
        if (file_exists($pdfPath)) unlink($pdfPath);
    
        // Prepare signature image (Base64)
        $signatureImage = null;
        if (!empty($proposal->signed_data['image_path'])) {
            $signatureFullPath = storage_path('app/public/' . $proposal->signed_data['image_path']);
            if (file_exists($signatureFullPath)) {
                $imageData = base64_encode(file_get_contents($signatureFullPath));
                $mimeType = mime_content_type($signatureFullPath);
                $signatureImage = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // Prepare company logo (Base64)
        $companyLogo = null;
        $user = $proposal->user;
        if ($user && $user->logo_path) {
            $logoFullPath = storage_path('app/public/' . $user->logo_path);
            if (file_exists($logoFullPath)) {
                $imageData = base64_encode(file_get_contents($logoFullPath));
                $mimeType = mime_content_type($logoFullPath);
                $companyLogo = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // Template
        $template = $proposal->template;
        if (!$template) return response()->json(['error' => 'No template linked'], 404);
    
        $templateContent = $template->content;
        $lineItemsHtml = ProposalHelper::generateLineItemsTable($proposal);
    
        // Replace placeholders EXCEPT line_items
        $placeholders = [
            '{{client_name}}' => $proposal->client->name ?? '',
            '{{client_company}}' => $proposal->client->company ?? '',
            '{{project_details}}' => $proposal->project_details ?? '',
            '{{your_name}}' => $proposal->your_name ?? '',
            '{{your_position}}' => $proposal->your_position ?? '',
            '{{your_contact_info}}' => $proposal->your_contact_info ?? '',
            '{{your_company_line}}' => $proposal->your_company ? ', '.$proposal->your_company : ', Independent Consultant',
            // leave {{line_items}} untouched for now
        ];
    
        $contentWithPlaceholders = strtr($templateContent, $placeholders);
    
        // Use CommonMark for Markdown -> HTML
        $converter = new CommonMarkConverter([
            'html_input' => 'strip', // keeps raw HTML like tables untouched
            'allow_unsafe_links' => false,
        ]);
    
        // Temporarily replace line_items with a token
        $contentWithToken = str_replace('{{line_items}}', '%%LINE_ITEMS%%', $contentWithPlaceholders);
    
        $htmlContent = $converter->convert($contentWithToken);
    
        // Put the table back
        $htmlContent = str_replace('%%LINE_ITEMS%%', $lineItemsHtml, $htmlContent);
    
        // Render Blade
        $html = view('proposals.pdf', [
            'proposal' => $proposal,
            'filledContent' => $htmlContent,
            'signatureImage' => $signatureImage,
            'companyLogo' => $companyLogo, // ← Add company logo
        ])->render();
    
        // Generate PDF
        $remoteIp = env('BROWSERSHOT_REMOTE_IP', 'local.test');
        $remotePort = env('BROWSERSHOT_REMOTE_PORT', 9222);
        
        Browsershot::html($html)
        ->setRemoteInstance($remoteIp, $remotePort)
            ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
            ->format('A4')
            ->save($pdfPath);
    
        return response()->file($pdfPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="proposal_' . $proposal->id . '.pdf"',
        ]);
    }
    
    public function generatePdf(Proposal $proposal)
    {
        $this->authorizeProposal(request(), $proposal);
    
        $folderPath = storage_path('app/public/proposals');
        if (!is_dir($folderPath)) mkdir($folderPath, 0755, true);
    
        $pdfPath = $folderPath . '/proposal_' . $proposal->id . '.pdf';
        if (file_exists($pdfPath)) unlink($pdfPath);
    
        // --- Prepare signature image ---
        $signatureImage = null;
        if (!empty($proposal->signed_data['image_path'])) {
            $signatureFullPath = storage_path('app/public/' . $proposal->signed_data['image_path']);
            if (file_exists($signatureFullPath)) {
                $imageData = base64_encode(file_get_contents($signatureFullPath));
                $mimeType = mime_content_type($signatureFullPath);
                $signatureImage = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // --- Prepare company logo ---
        $companyLogo = null;
        $user = $proposal->user;
        if ($user && $user->logo_path) {
            $logoFullPath = storage_path('app/public/' . $user->logo_path);
            if (file_exists($logoFullPath)) {
                $imageData = base64_encode(file_get_contents($logoFullPath));
                $mimeType = mime_content_type($logoFullPath);
                $companyLogo = 'data:' . $mimeType . ';base64,' . $imageData;
            }
        }
    
        // --- Template ---
        $template = $proposal->template;
        if (!$template) return response()->json(['error' => 'No template linked'], 404);
    
        // 1️⃣ Sanitize template content
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $cleanContent = $purifier->purify($template->content);
    
        // 2️⃣ Replace placeholders except line_items
        $placeholders = [
            '{{client_name}}' => $proposal->client->name ?? '',
            '{{client_company}}' => $proposal->client->company ?? '',
            '{{project_details}}' => $proposal->project_details ?? '',
            '{{your_name}}' => $proposal->your_name ?? '',
            '{{your_position}}' => $proposal->your_position ?? '',
            '{{your_contact_info}}' => $proposal->your_contact_info ?? '',
            '{{your_company_line}}' => $proposal->your_company ? ', '.$proposal->your_company : ', Independent Consultant',
        ];
        $contentWithPlaceholders = strtr($cleanContent, $placeholders);
    
        // 3️⃣ Handle line items
        $lineItemsHtml = ProposalHelper::generateLineItemsTable($proposal);
        $placeholderToken = '%%LINE_ITEMS%%';
        $contentWithToken = str_replace('{{line_items}}', $placeholderToken, $contentWithPlaceholders);
    
        // 4️⃣ Convert Markdown -> HTML safely
        $converter = new CommonMarkConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
        $htmlContent = $converter->convert($contentWithToken);
    
        // 5️⃣ Put table back
        $finalContent = str_replace($placeholderToken, $lineItemsHtml, (string)$htmlContent);
    
        // 6️⃣ Render Blade
        $html = view('proposals.pdf', [
            'proposal' => $proposal,
            'filledContent' => $finalContent,
            'signatureImage' => $signatureImage,
            'companyLogo' => $companyLogo,
        ])->render();
    
        // 7️⃣ Generate PDF
        $remoteIp = env('BROWSERSHOT_REMOTE_IP', 'local.test');
        $remotePort = env('BROWSERSHOT_REMOTE_PORT', 9222);
    
        Browsershot::html($html)
            ->setRemoteInstance($remoteIp, $remotePort)
            ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
            ->format('A4')
            ->save($pdfPath);
    
        return response()->file($pdfPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="proposal_' . $proposal->id . '.pdf"',
        ]);
    }
    
}


