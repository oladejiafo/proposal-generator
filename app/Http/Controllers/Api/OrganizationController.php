<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
{
    public function checkOrganization(Request $request)
    {
        $hasOrganization = $request->user()->organizations()->exists();
        
        return response()->json([
            'has_organization' => $hasOrganization
        ]);
    }

    public function createOrganization(Request $request)
    {
        $data = $request->validate([
            'organization_name' => 'required|string|max:255'
        ]);

        return DB::transaction(function () use ($request, $data) {
            // Create organization
            $organization = Organization::create([
                'name' => $data['organization_name']
            ]);

            // Attach user as owner
            $organization->users()->attach($request->user()->id, [
                'role' => 'owner'
            ]);

            // Set as current organization in session
            session(['current_organization_id' => $organization->id]);

            return response()->json([
                'message' => 'Organization created successfully',
                'organization' => $organization
            ], 201);
        });
    }
}