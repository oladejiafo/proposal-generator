<?php

namespace App\Services;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Http;
use Exception;

class PaymentService
{
    public function createSubscription($user, $priceId, $organization)
    {
        $provider = config('payments.default', 'stripe');
        
        if ($provider === 'stripe') {
            return $this->createStripeSubscription($user, $priceId, $organization);
        } elseif ($provider === 'flutterwave') {
            return $this->createFlutterwaveSubscription($user, $priceId, $organization);
        }
        
        throw new Exception("Unsupported payment provider: {$provider}");
    }

    protected function createStripeSubscription($user, $priceId, $organization)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\Checkout\Session::create([
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1
            ]],
            'mode' => 'subscription',
            'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('subscription.cancel'),
            'customer_email' => $user->email,
            'client_reference_id' => $organization->id,

            'metadata' => [ // ADD THIS
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'price_id' => $priceId
            ]
        ]);

        return [
            'id' => $session->id,
            'url' => $session->url
        ];
    }

    protected function createFlutterwaveSubscription($user, $priceId, $organization)
    {
        // Map Stripe price IDs to Flutterwave amounts
        $priceMap = [
            'price_1S5MWhAWSxFynBRlSYce3MU3' => 8.88, // monthly
            'price_1S5MZJAWSxFynBRlCM7lP8Qu' => 88.80, // annual
        ];
        
        $amount = $priceMap[$priceId] ?? 0;
        $txRef = 'FLW_' . uniqid();
        
        $data = [
            'tx_ref' => $txRef,
            'amount' => $amount,
            'currency' => 'USD',
            'payment_options' => 'card, account',
            'redirect_url' => route('subscription.success') . '?tx_ref=' . $txRef,
            'customer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'meta' => [
                'fee_bearer' => 'account' // 'account' = you bear fees, 'subaccount' = customer bears fees
            ],
            'customizations' => [
                'title' => 'Subscription Payment',
                'description' => 'Proposal app subscription',
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.flutterwave.secret_key'),
            'Content-Type' => 'application/json'
        ])->post('https://api.flutterwave.com/v3/payments', $data);

        if ($response->failed()) {
            throw new Exception("Flutterwave error: " . $response->body());
        }

        $responseData = $response->json();

        if ($responseData['status'] !== 'success') {
            throw new Exception("Flutterwave error: " . ($responseData['message'] ?? 'Unknown error'));
        }

        return [
            'id' => $txRef,
            'url' => $responseData['data']['link']
        ];
    }
}