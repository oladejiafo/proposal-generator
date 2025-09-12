<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function registerXX(Request $request)
    {
        $data = $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|email|unique:users',
            'password'=>'required|string|min:6|confirmed',
            'organization_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name'=>$data['name'],
            'email'=>$data['email'],
            'password'=>bcrypt($data['password']),
        ]);

        // Create organization in the organizations table
        $organizationName = $data['organization_name'] ?? $data['name'] . "'s Organization";
        
        $organization = Organization::create([
            'name' => $organizationName
        ]);

        // Attach user as owner in organization_user table
        $organization->users()->attach($user->id, [
            'role' => 'owner'
        ]);
        // Set organization in session for immediate use
        session(['current_organization_id' => $organization->id]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user'=>$user, 'token'=>$token, 'organization' => $organization]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'organization_name' => 'nullable|string|max:255',
            'plan' => 'required|in:free,monthly,annual'
        ]);

        // First, create the organization
        $organizationName = $data['organization_name'] ?? $data['name'] . "'s Organization";
        $organization = Organization::create([
            'name' => $organizationName,
            'subscription_type' => $data['plan'], // Set plan type here
            'subscription_status' => $data['plan'] === 'free' ? 'active' : 'pending' // Set status here
        ]);

        // Then create the user with the organization_id
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'organization_id' => $organization->id,
        ]);

        // Create subscription record for ALL plans
        $subscriptionData = [
            'user_id' => $user->id,
            'organization_id' => $organization->id, // Add organization_id
            'type' => 'default',
            'stripe_status' => $data['plan'] === 'free' ? 'active' : 'incomplete',
            'quantity' => 1,
            'ends_at' => null,
        ];

        if ($data['plan'] === 'free') {
            // For free plan: create a manual subscription that never ends
            $subscriptionData['stripe_id'] = 'free_plan_' . Str::random(10);
            $subscriptionData['stripe_price'] = 'free';
        } else {
            // For paid plans: create an incomplete subscription
            $subscriptionData['stripe_id'] = 'pending_' . Str::random(10);
            $subscriptionData['stripe_price'] = $data['plan'] === 'monthly' ? 'price_monthly' : 'price_annual';
        }

        // Create the subscription record
        $subscription = Subscription::create($subscriptionData);

        // Set organization in session
        session(['current_organization_id' => $organization->id]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'organization' => $organization,
            'requires_payment' => $data['plan'] !== 'free',
            'subscription' => $subscription
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        // Set current organization in session
        session(['current_organization_id' => $user->organization_id]);

        $token = $user->createToken('api-token')->plainTextToken;

        $organization = $user->organization;
    
        // Check subscription status using the subscriptions table
        $activeSubscription = $organization->subscriptions()
            ->where('type', 'default')
            ->where(function ($query) {
                $query->where('stripe_status', 'active')
                      ->orWhere('stripe_status', 'trialing');
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>', now());
            })
            ->first();
    
        $requiresPayment = !$activeSubscription && $organization->subscription_type !== 'free';
    
        return response()->json([
            'user' => $user,
            'token' => $token,
            'organization' => $organization,
            'requires_payment' => $requiresPayment
        ]);
    }

    public function loginX(Request $request)
    {
        $data = $request->validate([
            'email'=>'required|email',
            'password'=>'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email'=>['Invalid credentials.']]);
        }

        // Set the first organization as current session
        if ($user->organizations()->exists()) {
            $organization = $user->organizations()->first();
            session(['current_organization_id' => $organization->id]);
        } else {
            // Fallback: create organization if somehow missing
            $organization = Organization::create([
                'name' => $user->name . "'s Organization"
            ]);
            $organization->users()->attach($user->id, ['role' => 'owner']);
            session(['current_organization_id' => $organization->id]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user'=>$user, 'token'=>$token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'contact_info' => 'nullable|string',
        ]);

        $user->update($data);

        return response()->json(['message' => 'Profile updated successfully']);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($data['new_password'])
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120' // 5MB max
        ]);
    
        $user = $request->user();
        
        // Delete old logo if exists
        if ($user->logo_path) {
            Storage::delete($user->logo_path);
        }
    
        // Store new logo
        $path = $request->file('logo')->store('logos', 'public');
        
        $user->update([
            'logo_path' => $path
        ]);
    
        return response()->json([
            'message' => 'Logo uploaded successfully',
            'logo_url' => Storage::url($path)
        ]);
    }
    
    public function removeLogo(Request $request)
    {
        $user = $request->user();
        
        if ($user->logo_path) {
            Storage::delete($user->logo_path);
            $user->update(['logo_path' => null]);
        }
    
        return response()->json(['message' => 'Logo removed successfully']);
    }
}