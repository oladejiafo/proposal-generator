<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\UsageService;

class CheckUsageLimits
{
    public function handle(Request $request, Closure $next, string $type): Response
    {
        $organization = $request->user()->organization;
        
        if (!UsageService::checkLimit($organization, $type)) {
            return response()->json([
                'error' => "free_plan_{$type}_limit_exceeded",
                'message' => "You have reached your free plan {$type} limit. Please upgrade to create more {$type}."
            ], 403);
        }

        return $next($request);
    }
    private function isProposalCreationRequest(Request $request): bool
    {
        return $request->is('api/proposals') && 
               $request->method() === 'POST' &&
               $request->user()->organization->subscription_type === 'free';
    }
}