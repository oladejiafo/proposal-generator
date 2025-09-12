<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\UsageService;
use Symfony\Component\HttpFoundation\Response;

class CheckTemplateLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = $request->user()->organization;
        
        if (!UsageService::checkLimit($organization, 'templates')) {
            return response()->json([
                'error' => 'free_plan_template_limit_exceeded',
                'message' => 'You have reached your free plan private template limit. Please upgrade to add more templates.'
            ], 403);
        }

        return $next($request);
    }
}