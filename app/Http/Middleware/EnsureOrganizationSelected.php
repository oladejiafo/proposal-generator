<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationSelected
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return $next($request);
        }

        // Check if organizations table exists (for first-time setup)
        if (!Schema::hasTable('organizations') || !Schema::hasTable('organization_user')) {
            return $next($request);
        }

        $userId = Auth::id();
        
        $organizationCount = DB::table('organization_user')
            ->where('user_id', $userId)
            ->count();

        if ($organizationCount === 0) {
            $this->createDefaultOrganization($userId);
        }

        if (!Session::has('current_organization_id')) {
            $this->setDefaultOrganization($userId);
        }

        return $next($request);
    }

    protected function createDefaultOrganization($userId)
    {
        $organizationId = DB::table('organizations')->insertGetId([
            'name' => Auth::user()->name . "'s Organization",
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        DB::table('organization_user')->insert([
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'role' => 'owner',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Only migrate data if the columns exist
        if (Schema::hasColumn('clients', 'organization_id')) {
            DB::table('clients')
                ->where('user_id', $userId)
                ->update(['organization_id' => $organizationId]);
        }
        
        if (Schema::hasColumn('proposals', 'organization_id')) {
            DB::table('proposals')
                ->where('user_id', $userId)
                ->update(['organization_id' => $organizationId]);
        }
    }

    protected function setDefaultOrganization($userId)
    {
        $firstOrganization = DB::table('organization_user')
            ->where('user_id', $userId)
            ->first();
            
        if ($firstOrganization) {
            Session::put('current_organization_id', $firstOrganization->organization_id);
        }
    }
}