<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\UsageService;
use Symfony\Component\HttpFoundation\Response;

class CheckClientLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = $request->user()->organization;
        
        if (!UsageService::checkLimit($organization, 'clients')) {
            return response()->json([
                'error' => 'free_plan_client_limit_exceeded',
                'message' => 'You have reached your free plan client limit. Please upgrade to add more clients.'
            ], 403);
        }

        return $next($request);
    }
}
