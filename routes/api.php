<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProposalTemplateController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AiController;
use App\Models\Organization;
use Illuminate\Http\Request;
use App\Services\UsageService;

use App\Http\Controllers\TeamController;


// ==================== PUBLIC ROUTES ====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Auth routes
Route::post('/logout', [AuthController::class, 'logout']);

// Public proposal routes (no auth required)
Route::middleware('throttle:20,1')->group(function () {
    Route::get('/predefined-proposals', [ProposalController::class, 'predefinedProposals']);
    Route::get('/proposal/view/{token}', [ProposalController::class, 'viewSecure']);
    Route::post('/proposal/sign/{token}', [ProposalController::class, 'signProposal']);
    Route::post('/proposals/viewed', [ProposalController::class, 'markViewed']);
    Route::post('/proposals/accept', [ProposalController::class, 'acceptProposal']);
});

// Stripe webhook (must be public)
Route::post('/stripe/webhook', [PaymentController::class, 'handle']);

// Subscription success/cancel pages (public)
Route::get('/subscription/success', [PaymentController::class, 'subscriptionSuccess'])
    ->name('subscription.success');
Route::get('/subscription/cancel', [PaymentController::class, 'subscriptionCancel'])
    ->name('subscription.cancel');

// Payment success/cancel pages (public)
Route::get('/payments/success/{proposal}', [PaymentController::class, 'success'])
    ->name('payment.success');
Route::get('/payments/cancel/{proposal}', [PaymentController::class, 'cancel'])
    ->name('payment.cancel');

Route::middleware('auth:sanctum')->get('/usage/stats', function (Request $request) {
    $usageStats = UsageService::getUsageStats($request->user()->organization);
    return response()->json($usageStats);
});
  
// ==================== PROTECTED ROUTES (AUTH ONLY) ====================
Route::middleware('auth:sanctum')->group(function () {
    // Organization routes (should be accessible without active subscription)
    Route::get('/current-organization', function (Request $request) {
        $user = $request->user();
        $user->load('organization'); // Eager load organization
        
        if (!$user->organization) {
            return response()->json([
                'error' => 'Organization not found',
                'user_id' => $user->id
            ], 404);
        }
        
        return response()->json($user->organization);
    });
    
    Route::get('/check-organization', [OrganizationController::class, 'checkOrganization']);
    Route::post('/create-organization', [OrganizationController::class, 'createOrganization']);
    
    // User profile routes
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load('organization');
        return response()->json($user);
    });
    
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/user/logo', [AuthController::class, 'uploadLogo']);
    Route::delete('/user/logo', [AuthController::class, 'removeLogo']);

    Route::get('/organizations/{organization}/team', [TeamController::class, 'index']);
    Route::post('/organizations/{organization}/team', [TeamController::class, 'store']);
    Route::delete('/organizations/{organization}/team/{user}', [TeamController::class, 'destroy']);

});

// ==================== PROTECTED ROUTES (AUTH + SUBSCRIPTION) ====================
Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckSubscription::class])->group(function () {
    // Payment routes
    Route::post('/payments/checkout/{proposal}', [PaymentController::class, 'createCheckoutSession'])
        ->name('payments.checkout');
    Route::post('/organization/subscribe', [PaymentController::class, 'subscribe']);

    // Dashboard & stats
    Route::get('/dashboard/stats', function (Request $request) {
        $user = $request->user();
    
        // Use query builder consistently to ensure scope applies
        $proposalsQuery = $user->proposals();
        
        // Basic counts - all using the user relationship
        $clientsCount = $user->clients()->count();
        $proposalsCount = $proposalsQuery->count();
        $templatesCount = $user->templates()->count();
    
        // At a Glance
        $clientsThisMonth = $user->clients()
            ->whereMonth('created_at', now()->month)
            ->count();
    
        // Proposal acceptance rate - use the query builder
        $acceptedProposals = $proposalsQuery->where('status', 'accepted')->count();
        $acceptanceRate = $proposalsCount > 0 ? round(($acceptedProposals / $proposalsCount) * 100, 1) : 0;
    
        // Average response time (only non-draft proposals)
        $nonDraftProposals = $proposalsQuery
            ->where('status', '!=', 'draft')
            ->get();
    
        // FIXED: Calculate average response time correctly
        $validAcceptedProposals = $nonDraftProposals
            ->filter(fn($p) => $p->accepted_at && $p->accepted_at->gt($p->created_at));
        
        $avgResponseTimeHours = $validAcceptedProposals->count() > 0
            ? $validAcceptedProposals->avg(fn($p) => $p->created_at->diffInHours($p->accepted_at))
            : 0;
    
        // View → acceptance ratio
        $totalViewedProposals = $nonDraftProposals->filter(fn($p) => $p->views > 0)->count();
        $viewAcceptanceRatio = $totalViewedProposals > 0
            ? round(($acceptedProposals / $totalViewedProposals) * 100, 2)
            : 0;    
    
        // Recent proposals - create a new query to avoid conflicts
        $recentProposals = $user->proposals()
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'status', 'created_at']);
    
        // Monthly proposal trends
        $proposalTrends = $user->proposals()
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    
        return response()->json([
            'clientsCount' => $clientsCount,
            'proposalsCount' => $proposalsCount,
            'templatesCount' => $templatesCount,
            'insights' => [
                'clientsThisMonth' => $clientsThisMonth,
                'acceptanceRate' => $acceptanceRate,
                'avgResponseTimeDays' => round($avgResponseTimeHours / 24, 1),
            ],
            'analytics' => [
                'viewAcceptanceRatio' => $viewAcceptanceRatio,
                'avgResponseTimeHours' => round($avgResponseTimeHours, 1),
                'validProposalsForAvg' => $validAcceptedProposals->count(),
            ],
            'recentProposals' => $recentProposals,
            'proposalTrends' => $proposalTrends,
        ]);
    });

    // API Resources (require active subscription)
    Route::middleware([\App\Http\Middleware\CheckUsageLimits::class . ':client'])->post('/clients', [ClientController::class, 'store']);
    Route::apiResource('clients', ClientController::class)->except(['store']);

    // Apply template limit middleware  
    Route::middleware([\App\Http\Middleware\CheckUsageLimits::class . ':templates'])->post('/proposal-templates', [ProposalTemplateController::class,'store']);
    Route::apiResource('proposal-templates', ProposalTemplateController::class)->except(['store']);

    Route::get('predefined-proposals', [ProposalTemplateController::class, 'proposalIndex']);
    Route::middleware([\App\Http\Middleware\CheckUsageLimits::class . ':templates'])->post('predefined-proposals', [ProposalTemplateController::class, 'proposalStore']);
    Route::put('predefined-proposals/{id}', [ProposalTemplateController::class, 'proposalUpdate']);
    Route::delete('predefined-proposals/{id}', [ProposalTemplateController::class, 'proposalDestroy']);
    
    // Apply the usage middleware to proposal creation
    Route::middleware([\App\Http\Middleware\CheckUsageLimits::class . ':proposal'])->post('/proposals', [ProposalController::class, 'store']);
    Route::apiResource('proposals', ProposalController::class)->except(['store']);
    // Route::apiResource('proposals', ProposalController::class);

    // Additional proposal routes
    Route::post('/proposals/{proposal}/send', [ProposalController::class, 'sendToClient']);
    Route::post('/proposals/{proposal}/sign', [ProposalController::class, 'sign']);
    Route::get('/proposals/{proposal}/pdf', [ProposalController::class, 'generatePdf']);

    // AI routes
    Route::post('/ai/generate-proposal-text', [AiController::class, 'generateProposalText']);

    // Simple me route
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});

// ==================== PROTECTED ROUTES (AUTH ONLY - NO SUBSCRIPTION) ====================
Route::middleware('auth:sanctum')->group(function () {
    // Routes that don't require subscription but need auth
    // For example: subscription management, billing portal, etc.
    Route::get('/api/organization', function (Request $request) {
        $org = $request->user()->organization;
        return [
            'id' => $org->id,
            'subscription_active' => $org->hasActiveSubscription(), // Use your custom method
        ];
    });
});
