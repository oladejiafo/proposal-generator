<?php
// app/Http/Middleware/SetCurrentOrganization.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetCurrentOrganization
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Example: get org from header, query param, or default to first org
        $orgId = $request->header('X-Organization-ID') ?? $request->query('org') ?? $user->organizations()->first()->id ?? null;

        if (!$orgId || !$user->organizations()->where('organization_id', $orgId)->exists()) {
            return response()->json(['message' => 'Invalid organization'], 403);
        }

        // Store current org id on user (or session)
        $user->current_organization_id = $orgId;

        return $next($request);
    }
}