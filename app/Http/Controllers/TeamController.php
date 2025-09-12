<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    // List members in the current org
    public function index(Request $request)
    {
        $org = $request->user()->currentOrganization();

        return response()->json([
            'members' => $org->users()->get()
        ]);
    }

    // Invite/add a new member (paid only)
    public function store(Request $request, Organization $organization)
    {
        // Check plan
        if ($organization->subscription_type !== 'free') {
            return response()->json([
                'error' => 'Teams are only available on paid plans'
            ], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6', // Or generate random
            'role' => 'required|in:owner,admin,member,guest',
        ]);

        // Create the user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'organization_id' => $organization->id,
        ]);

        // Attach user to org with role
        $organization->users()->attach($user->id, [
            'role' => $data['role'],
        ]);

        return response()->json([
            'message' => 'User added successfully',
            'user' => $user
        ]);
    }

    // Remove a member
    public function destroy(Organization $organization, User $user)
    {
        if ($organization->subscription_type === 'free') {
            return response()->json([
                'error' => 'Teams are only available on paid plans'
            ], 403);
        }

        $organization->users()->detach($user->id);

        return response()->json([
            'message' => 'User removed successfully'
        ]);
    }
}
