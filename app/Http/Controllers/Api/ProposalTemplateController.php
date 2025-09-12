<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProposalTemplate;
use App\Models\PredefinedProposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\UsageService;

class ProposalTemplateController extends Controller
{
    public function proposalIndex(Request $request)
    {
        $user = $request->user();
        $organization = $user->organization ?? $user->organizations()->first();
    
        // Get public templates
        $publicTemplates = PredefinedProposal::where('is_public', true)
            ->where(function ($query) use ($organization) {
                $query->where('is_premium', false);
    
                if ($organization && $organization->subscription_type !== 'free') {
                    $query->orWhere('is_premium', true);
                }
            })
            ->get();
    
        // Get user’s private templates
        $userTemplates = PredefinedProposal::where('user_id', $user->id)
            ->where('is_public', false)
            ->get();
    
        return response()->json([
            'public_templates' => $publicTemplates,
            'user_templates'   => $userTemplates,
        ]);
    }
    
    public function proposalStore(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required|string',
            'category' => 'required|string|max:255',
        ]);
    
        $user = $request->user();
        $organization = $user->organization ?? $user->organizations()->first();
    
        if (!$organization) {
            return response()->json(['error' => 'No organization found'], 400);
        }
    
        // Check template limit for free plan
        if ($organization->subscription_type === 'free') {
            $templateCount = PredefinedProposal::where('organization_id', $organization->id)
                ->where('is_public', false)
                ->count();
    
            if ($templateCount >= 5) {
                return response()->json([
                    'error'   => 'free_plan_template_limit_exceeded',
                    'message' => 'Free plan limited to 5 saved templates. Upgrade to save more.',
                ], 403);
            }
        }
    
        $template = PredefinedProposal::create([
            'user_id'         => $user->id,
            'organization_id' => $organization->id,
            'title'           => $data['title'],
            'content'         => $data['content'],
            'category'        => $data['category'],
            'is_premium'      => false,
            'is_public'       => false,
        ]);
    
        if ($organization->subscription_type === 'free') {
            UsageService::incrementUsage($organization, 'templates');
        }
    
        return response()->json($template, 201);
    }
    

    // Predefined Proposals - DELETE /predefined-proposals/{id}
    public function proposalDestroy(Request $request, $id)
    {
        $template = PredefinedProposal::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $template->delete();

        return response()->noContent();
    }

    // Regular Proposal Templates (Structure Templates)
    public function index()
    {
        $userId = Auth::id();
    
        // Fetch public templates + current user's private templates
        $templates = ProposalTemplate::where('is_public', true)
            ->orWhere('user_id', $userId)
            ->get();
    
        return response()->json($templates);
    }    

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'is_public' => 'sometimes|boolean',
        ]);

        $template = ProposalTemplate::create([
            'name' => $request->name,
            'content' => $request->content,
            'is_public' => $request->is_public ?? false,
            'user_id' => Auth::id(),
        ]);
        if ($request->user()->organization->subscription_type === 'free') {
            UsageService::incrementUsage($request->user()->organization, 'templates');
        }
        return response()->json($template, 201);
    }

    public function show($id)
    {
        $template = ProposalTemplate::where(function ($query) {
                $query->where('is_public', true)
                      ->orWhere('user_id', Auth::id());
            })
            ->findOrFail($id);

        return response()->json($template);
    }

    public function update(Request $request, $id)
    {
        $template = ProposalTemplate::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'is_public' => 'sometimes|boolean',
        ]);

        $template->update([
            'name' => $request->name,
            'content' => $request->content,
            'is_public' => $request->is_public ?? $template->is_public,
        ]);

        return response()->json($template);
    }

    public function destroy($id)
    {
        $template = ProposalTemplate::where('user_id', Auth::id())->findOrFail($id);
        $template->delete();

        return response()->noContent();
    }
}