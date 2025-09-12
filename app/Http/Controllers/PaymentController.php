<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proposal;
use App\Models\Organization;
use App\Models\Subscription;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request, Proposal $proposal)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $successUrl = route('payment.success', ['proposal' => $proposal->id]);
        $cancelUrl  = route('payment.cancel', ['proposal' => $proposal->id]);
        $priceId = $request->input('priceId');
        $session = CheckoutSession::create([
            'line_items' => [[
                'price' => $priceId, // real Stripe subscription price ID
                'quantity' => 1
            ]],
            'mode' => 'subscription',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ]);
        
        return response()->json(['id' => $session->id]);
    }

    public function subscribe(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        
        $organization = $request->user()->organization;
        
        if (!$organization) {
            return response()->json(['error' => 'User has no organization'], 400);
        }
        $priceId = $request->input('priceId');
        $successUrl = route('subscription.success');
        $cancelUrl = route('subscription.cancel');
        
        $session = CheckoutSession::create([
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1
            ]],
            'mode' => 'subscription',
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'customer_email' => $request->user()->email,
            'client_reference_id' => $organization->id,
        ]);
        
        // Return both ID and URL for flexibility
        return response()->json([
            'id' => $session->id,
            'url' => $session->url // Add this line
        ]);
    }

    public function success(Proposal $proposal)
    {
        // Mark proposal as paid
        $proposal->update(['status' => 'paid']);

        // Show a simple success page
        return view('payments.success', compact('proposal'));
    }

    public function cancel(Proposal $proposal)
    {
        return view('payments.cancel', compact('proposal'));
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');
    
        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Webhook error'], 400);
        }
    
        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                
                // Handle both one-time payments and subscriptions
                if ($session->mode === 'subscription') {
                    // Subscription payment
                    $organization = Organization::find($session->client_reference_id);
                    
                    if ($organization) {
                        // Update the subscription record
                        $subscription = $organization->subscriptions()
                            ->where('type', 'default')
                            ->first();
                        
                        if ($subscription) {
                            $subscription->update([
                                'stripe_id' => $session->subscription,
                                'stripe_status' => 'active',
                                'stripe_price' => $session->metadata->price_id ?? null,
                                'ends_at' => null
                            ]);
                        }
                        
                        // Update organization status
                        $organization->update([
                            'subscription_status' => 'active'
                        ]);
                    }
                } else if ($session->mode === 'payment') {
                    // One-time payment (for proposals)
                    $proposalId = $session->metadata->proposal_id ?? null;
                    if ($proposalId) {
                        $proposal = Proposal::find($proposalId);
                        if ($proposal) {
                            $proposal->update(['status' => 'paid']);
                        }
                    }
                }
                break;
    
            case 'invoice.payment_succeeded':
                // Handle recurring subscription payments
                $subscriptionId = $event->data->object->subscription;
                $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
                
                if ($subscription) {
                    $organization = $subscription->organization;
                    if ($organization) {
                        $organization->update(['subscription_status' => 'active']);
                        $subscription->update(['stripe_status' => 'active', 'ends_at' => null]);
                    }
                }
                break;
    
            case 'customer.subscription.deleted':
                // Handle subscription cancellations
                $subscriptionId = $event->data->object->id;
                $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
                
                if ($subscription) {
                    $subscription->update([
                        'stripe_status' => 'canceled',
                        'ends_at' => now()
                    ]);
                    
                    $organization = $subscription->organization;
                    if ($organization) {
                        $organization->update(['subscription_status' => 'canceled']);
                    }
                }
                break;
        }
    
        return response()->json(['status' => 'success']);
    }
    
    public function subscriptionSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');
        
        // Just show a success page - the webhook handles the actual processing
        Stripe::setApiKey(config('services.stripe.secret'));
        $session = CheckoutSession::retrieve($sessionId);
        
        return view('subscription.success', [
            'sessionId' => $sessionId,
            'isSubscription' => $session->mode === 'subscription'
        ]);
    }
    
    public function subscriptionCancel()
    {
        return view('payments.cancel');
    }
}
