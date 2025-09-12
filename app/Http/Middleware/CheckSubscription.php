<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for auth routes, payment routes, and webhook
        if ($this->shouldSkipMiddleware($request)) {
            return $next($request);
        }

        $user = $request->user();
        
        if (!$user || !$user->organization) {
            return response()->json(['error' => 'Organization not found'], 403);
        }

        $organization = $user->organization;

        // Use the same logic as your frontend ProtectedRoute
        if ($organization->subscription_type === 'free') {
            // Free plan always has access
            return $next($request);
        }

        if ($organization->subscription_status === 'active') {
            // Paid plan with active subscription
            return $next($request);
        }

        // Paid plan without active subscription
        return response()->json([
            'error' => 'Subscription required',
            'requires_payment' => true,
            'subscription_type' => $organization->subscription_type
        ], 402);
    }

    protected function shouldSkipMiddleware(Request $request): bool
    {
        $skipRoutes = [
            'login',
            'register',
            'logout',
            'password.*',
            'subscription.*',
            'payment.*',
            'stripe.webhook',
            // 'api.*',
        ];

        foreach ($skipRoutes as $route) {
            if ($request->is($route) || $request->routeIs($route)) {
                return true;
            }
        }

        return false;
    }
}