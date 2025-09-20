<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proposal;
use App\Models\Organization;
use App\Models\Subscription;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request, Proposal $proposal)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $successUrl = route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl  = route('subscription.cancel');

        // $successUrl = route('payment.success', ['proposal' => $proposal->id]);
        // $cancelUrl  = route('payment.cancel', ['proposal' => $proposal->id]);
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

    public function subscribeX(Request $request)
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
    public function subscribe(Request $request)
    {
        try {
            $organization = $request->user()->organization;
            
            if (!$organization) {
                return response()->json(['error' => 'User has no organization'], 400);
            }
            
            $priceId = $request->input('priceId');
            
            $paymentService = new PaymentService();
            $result = $paymentService->createSubscription(
                $request->user(), 
                $priceId, 
                $organization
            );
            
            // Return the same structure as before for frontend compatibility
            return response()->json([
                'id' => $result['id'],
                'url' => $result['url']
            ]);
    
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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

    public function handleXX(Request $request)
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
                    $organization = $subscription->organization;
                    
                    // Only update if this is the default subscription
                    if ($subscription->type === 'default') {
                        $subscription->update([
                            'stripe_status' => 'canceled',
                            'ends_at' => now()
                        ]);
                        
                        if ($organization) {
                            // Downgrade to free plan
                            $organization->update([
                                'subscription_type' => 'free',
                                'subscription_status' => 'active'
                            ]);
                        }
                    }
                }
                break;

            case 'customer.subscription.updated':
                $stripeSubscription = $event->data->object;
                $subscription = Subscription::where('stripe_id', $stripeSubscription->id)->first();
                
                if ($subscription && $stripeSubscription->cancel_at_period_end) {
                    // Subscription is scheduled to cancel at period end
                    $subscription->update([
                        'stripe_status' => 'pending_cancelation',
                        'ends_at' => now()->setTimestamp($stripeSubscription->current_period_end)
                    ]);
                    
                    $organization = $subscription->organization;
                    if ($organization) {
                        $organization->update([
                            'subscription_status' => 'pending_cancellation'
                        ]);
                    }
                }
                break;
                
        }
    
        return response()->json(['status' => 'success']);
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');
    
        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            Log::error('Stripe webhook validation error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook error'], 400);
        }
    
        Log::info('Stripe webhook received: ' . $event->type);
    
        try {
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;
    
                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event->data->object);
                    break;
    
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;
    
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;
            }
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response()->json(['error' => 'Processing failed'], 500);
        }
    
        return response()->json(['status' => 'success']);
    }
    
    protected function handleCheckoutSessionCompleted($session)
    {
        Log::info('Processing checkout.session.completed', ['session_id' => $session->id, 'mode' => $session->mode]);
    
        if ($session->mode === 'subscription') {
            $this->handleSubscriptionCheckout($session);
        } else if ($session->mode === 'payment') {
            $this->handleOneTimePayment($session);
        }
    }
    
    protected function handleSubscriptionCheckout($session)
    {
        $organizationId = $session->metadata->organization_id ?? $session->client_reference_id;
        
        if (!$organizationId) {
            Log::error('No organization ID found in session', ['session_id' => $session->id]);
            return;
        }
    
        $organization = Organization::find($organizationId);
        if (!$organization) {
            Log::error('Organization not found', ['organization_id' => $organizationId]);
            return;
        }
    
        // Get or create subscription
        $subscription = $organization->subscriptions()
            ->where('type', 'default')
            ->first();
    
        if (!$subscription) {
            $subscription = $organization->subscriptions()->create([
                'type' => 'default',
                'stripe_id' => $session->subscription,
                'stripe_status' => 'active',
                'stripe_price' => $session->metadata->price_id ?? null,
                'quantity' => 1,
            ]);
        } else {
            $subscription->update([
                'stripe_id' => $session->subscription,
                'stripe_status' => 'active',
                'stripe_price' => $session->metadata->price_id ?? null,
                'ends_at' => null
            ]);
        }
    
        // Update organization
        $organization->update([
            'subscription_type' => 'paid', // Make sure this is set to paid
            'subscription_status' => 'active'
        ]);
    
        Log::info('Subscription activated', [
            'organization_id' => $organization->id,
            'subscription_id' => $subscription->id
        ]);
    }
    
    protected function handleOneTimePayment($session)
    {
        $proposalId = $session->metadata->proposal_id ?? null;
        if ($proposalId) {
            $proposal = Proposal::find($proposalId);
            if ($proposal) {
                $proposal->update(['status' => 'paid']);
                Log::info('Proposal marked as paid', ['proposal_id' => $proposalId]);
            }
        }
    }
    
    protected function handleInvoicePaymentSucceeded($invoice)
    {
        if (!$invoice->subscription) {
            return; // Not a subscription invoice
        }
    
        $subscription = Subscription::where('stripe_id', $invoice->subscription)->first();
        if ($subscription) {
            $organization = $subscription->organization;
            if ($organization) {
                $organization->update(['subscription_status' => 'active']);
                $subscription->update(['stripe_status' => 'active', 'ends_at' => null]);
                
                Log::info('Subscription renewed', [
                    'subscription_id' => $subscription->id,
                    'organization_id' => $organization->id
                ]);
            }
        }
    }
    
    protected function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_id', $stripeSubscription->id)->first();
        if ($subscription && $subscription->type === 'default') {
            $subscription->update([
                'stripe_status' => 'canceled',
                'ends_at' => now()
            ]);
    
            $organization = $subscription->organization;
            if ($organization) {
                $organization->update([
                    'subscription_type' => 'free',
                    'subscription_status' => 'active'
                ]);
                
                Log::info('Subscription canceled and downgraded to free', [
                    'organization_id' => $organization->id
                ]);
            }
        }
    }
    
    protected function handleSubscriptionUpdated($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_id', $stripeSubscription->id)->first();
        if ($subscription) {
            if ($stripeSubscription->cancel_at_period_end) {
                $subscription->update([
                    'stripe_status' => 'pending_cancellation',
                    'ends_at' => now()->setTimestamp($stripeSubscription->current_period_end)
                ]);
    
                $organization = $subscription->organization;
                if ($organization) {
                    $organization->update([
                        'subscription_status' => 'pending_cancellation'
                    ]);
                    
                    Log::info('Subscription scheduled for cancellation', [
                        'organization_id' => $organization->id,
                        'ends_at' => $stripeSubscription->current_period_end
                    ]);
                }
            } else if ($stripeSubscription->status === 'active') {
                // Subscription was reactivated
                $subscription->update([
                    'stripe_status' => 'active',
                    'ends_at' => null
                ]);
    
                $organization = $subscription->organization;
                if ($organization) {
                    $organization->update([
                        'subscription_status' => 'active'
                    ]);
                }
            }
        }
    }

    protected function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');
    
        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            Log::error('Stripe webhook validation error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook error'], 400);
        }
    
        // Add your existing Stripe webhook handling logic here
        switch ($event->type) {
            case 'checkout.session.completed':
                // Handle session completed
                $session = $event->data->object;
                if ($session->mode === 'subscription') {
                    $this->handleStripeSubscription($session);
                }
                break;
                
            case 'invoice.payment_succeeded':
                // Handle successful payment
                $invoice = $event->data->object;
                $this->handleStripeInvoice($invoice);
                break;
                
            // Add other event types as needed
        }
    
        return response()->json(['status' => 'success']);
    }

    protected function handleStripeSubscription($session)
    {
        // Handle Stripe subscription creation
        $organizationId = $session->client_reference_id;
        $subscriptionId = $session->subscription;
        
        $organization = Organization::find($organizationId);
        if ($organization) {
            $subscription = $organization->subscriptions()
                ->where('type', 'default')
                ->first();
                
            if ($subscription) {
                $subscription->update([
                    'stripe_id' => $subscriptionId,
                    'stripe_status' => 'active',
                    'ends_at' => null
                ]);
            }
            
            $organization->update([
                'subscription_status' => 'active'
            ]);
        }
    }

    protected function handleStripeInvoice($invoice)
    {
        // Handle Stripe invoice payment
        $subscriptionId = $invoice->subscription;
        $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
        
        if ($subscription) {
            $organization = $subscription->organization;
            if ($organization) {
                $organization->update(['subscription_status' => 'active']);
                $subscription->update(['stripe_status' => 'active', 'ends_at' => null]);
            }
        }
    }

    protected function handleFlutterwaveWebhook(Request $request)
    {
        $payload = $request->all();
        $secretHash = config('services.flutterwave.secret_hash');
        
        // Verify webhook signature if secret hash is set
        if (!empty($secretHash) && isset($payload['secret_hash']) && $payload['secret_hash'] !== $secretHash) {
            Log::error('Flutterwave webhook invalid secret hash');
            return response()->json(['error' => 'Invalid secret hash'], 400);
        }
    
        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];
    
        Log::info("Flutterwave webhook received: {$event}", $data);
    
        switch ($event) {
            case 'charge.completed':
                $this->processFlutterwavePayment($data);
                break;
                
            case 'subscription.created':
                $this->processFlutterwaveSubscription($data);
                break;
                
            default:
                Log::info("Unhandled Flutterwave event: {$event}");
        }
    
        return response()->json(['status' => 'success']);
    }
    
    // Add these helper methods
    protected function processFlutterwavePayment(array $data)
    {
        // Handle successful payment
        $txRef = $data['tx_ref'] ?? '';
        $amount = $data['amount'] ?? 0;
        $status = $data['status'] ?? '';
        
        Log::info("Processing Flutterwave payment: {$txRef}, Amount: {$amount}, Status: {$status}");
        
        // Add your payment processing logic here
    }
    
    protected function processFlutterwaveSubscription(array $data)
    {
        // Handle subscription creation
        $planId = $data['plan'] ?? '';
        $customerEmail = $data['customer']['email'] ?? '';
        
        Log::info("Processing Flutterwave subscription: Plan: {$planId}, Email: {$customerEmail}");
        
        // Add your subscription processing logic here
    }

    public function subscriptionSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            // return redirect()->route('home')->with('error', 'Invalid session');
        }
    
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $session = CheckoutSession::retrieve($sessionId);
            
            // Check if the session was successful
            if ($session->payment_status === 'paid') {
                return view('subscription.success', [
                    'sessionId' => $sessionId,
                    'isSubscription' => $session->mode === 'subscription'
                ]);
            } else {
                return redirect()->route('subscription.cancel')
                    ->with('error', 'Payment was not completed successfully');
            }
            
        } catch (\Exception $e) {
            Log::error('Subscription success error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Could not verify payment status');
        }
    }
    
    public function subscriptionCancel()
    {
        return view('subscription.cancel');
    }

    public function downgradeSubscription(Request $request)
    {
        $user = $request->user();
        $organization = $user->organization;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization not found'], 404);
        }
        
        // Check if user is on a paid plan
        if ($organization->subscription_type === 'free') {
            return response()->json(['error' => 'Already on free plan'], 400);
        }
        
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            
            // Get current subscription
            $subscription = $organization->subscriptions()
                ->where('type', 'default')
                ->where('stripe_status', 'active')
                ->first();

            // Log::info('Retrieving Stripe subscription: ' . $subscription->stripe_id);

            if ($subscription && Str::startsWith($subscription->stripe_id, 'sub_')) {
                // This is a real Stripe subscription
                $stripeSubscription = \Stripe\Subscription::retrieve($subscription->stripe_id);
                $stripeSubscription->cancel_at_period_end = true;
                $stripeSubscription->save();

                $subscription->update([
                    'stripe_status' => 'pending_cancellation',
                    'ends_at' => now()->setTimestamp($stripeSubscription->current_period_end)
                ]);
            
                $organization->update([
                    'subscription_status' => 'pending_cancellation',
                    // keep subscription_type as paid until Stripe confirms cancellation
                ]);
            
                return response()->json([
                    'message' => 'Subscription will downgrade to free at the end of the billing period',
                    'downgrade_date' => now()->setTimestamp($stripeSubscription->current_period_end)
                ]);
            } else {
                // Not a real Stripe sub → downgrade immediately
                $organization->update([
                    'subscription_type' => 'free',
                    'subscription_status' => 'active'
                ]);
            
                if ($subscription) {
                    $subscription->update([
                        'stripe_status' => 'canceled',
                        'ends_at' => now(),
                        'stripe_price' => 'free',
                        // 'stripe_id' => null // clear fake id
                    ]);
                }

                return response()->json(['message' => 'Successfully downgraded to free plan']);
            }            
            
            // If no Stripe subscription found, just downgrade immediately
            $organization->update([
                'subscription_type' => 'free',
                'subscription_status' => 'active'
            ]);
            
            if ($subscription) {
                $subscription->update([
                    'stripe_status' => 'canceled',
                    'ends_at' => now(),
                    'stripe_price' => 'free'
                ]);
            }
            
            return response()->json(['message' => 'Successfully downgraded to free plan']);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to downgrade subscription: ' . $e->getMessage()], 500);
        }
    }

    // Add this method to handle immediate cancellation
    public function cancelSubscription(Request $request)
    {
        $user = $request->user();
        $organization = $user->organization;
        
        if (!$organization) {
            return response()->json(['error' => 'Organization not found'], 404);
        }
        
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            
            $subscription = $organization->subscriptions()
                ->where('type', 'default')
                ->where('stripe_status', 'active')
                ->first();
            
            if ($subscription && Str::startsWith($subscription->stripe_id, 'sub_')) {
                // Real Stripe subscription → cancel at Stripe
                $stripeSubscription = \Stripe\Subscription::retrieve($subscription->stripe_id);
                $stripeSubscription->cancel();
                
                // Update local records
                $subscription->update([
                    'stripe_status' => 'canceled',
                    'ends_at' => now(),
                ]);
                
                $organization->update([
                    'subscription_type' => 'free',
                    'subscription_status' => 'active'
                ]);
                
                return response()->json(['message' => 'Subscription canceled successfully']);
            } else {
                // Fake/free subscription → cancel locally only
                if ($subscription) {
                    $subscription->update([
                        'stripe_status' => 'canceled',
                        'ends_at' => now(),
                        'stripe_price' => 'free',
                    ]);
                }
    
                $organization->update([
                    'subscription_type' => 'free',
                    'subscription_status' => 'active'
                ]);
                
                return response()->json(['message' => 'Subscription downgraded to free (no Stripe subscription)']);
            }
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to cancel subscription: ' . $e->getMessage()], 500);
        }
    }
    
}
