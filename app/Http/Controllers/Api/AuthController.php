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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;

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
        // $request->user()->currentAccessToken()->delete();
        $request->user()->tokens()->delete();
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

    // Add this method to AuthController
    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        
        // Validate the request
        $request->validate([
            'confirmation' => 'required|in:DELETE MY ACCOUNT'
        ]);

        try {
            DB::beginTransaction();
            // Get organization
            $organization = $user->organization;
            
            if ($organization) {

                $subscription = $organization->subscriptions()
                    ->where('type', 'default')
                    ->whereIn('stripe_status', ['active', 'trialing'])
                    ->first();

                if ($subscription) {
                    try {
                        if (Str::startsWith($subscription->stripe_id, 'sub_')) {
                            Stripe::setApiKey(config('services.stripe.secret'));
                            $stripeSubscription = \Stripe\Subscription::retrieve($subscription->stripe_id);
                            $stripeSubscription->cancel();

                        } else {
                            $subscription->update([
                                'stripe_status' => 'canceled',
                                'ends_at' => now(),
                                'stripe_price' => 'free',
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to cancel subscription {$subscription->id} during account deletion: {$e->getMessage()}");
                    }
                    
                } 

                try {
                    // Soft delete related data (adjust based on your model relationships)
                    $organization->proposals()->delete();
                    $organization->clients()->delete();
                    $user->templates()->delete();
                    $organization->subscriptions()->delete();
                    
                    // Delete organization
                    $organization->delete();
                } catch (\Exception $e) {
                    Log::info($e->getMessage());
                }
            }
            
            // Delete user's personal data
            $user->tokens()->delete();

            if (in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($user))) {
                $user->delete();
            } else {
                $user->forceDelete();
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Account and all associated data have been permanently deleted'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete account: ' . $e->getMessage()
            ], 500);
        }
    }

    // Add this method for account deletion confirmation
    public function requestAccountDeletion(Request $request)
    {
        $user = $request->user();
        
        // You might want to send an email confirmation here
        // or perform additional checks before allowing deletion
        
        return response()->json([
            'message' => 'Please confirm account deletion',
            'confirmation_required' => 'DELETE MY ACCOUNT'
        ]);
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