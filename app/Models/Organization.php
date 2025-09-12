<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
// use Laravel\Cashier\Billable;

class Organization extends Model
{
    use HasFactory; //, Billable;

    protected $fillable = [
        'name',
        'stripe_id',
        'pm_type',
        'pm_last_four',
        'trial_ends_at',
        'subscription_type',
        'subscription_status',

        'monthly_proposal_limit',
        'proposals_used_this_month',
        'usage_reset_at',
        'templates_limit',
        'templates_used',
        'clients_limit',
        'clients_used'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

        /**
     * Get the subscriptions for the organization.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the default subscription for the organization.
     */
    public function defaultSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->ofType('default');
    }

    /**
     * Determine if the organization has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscriptions()
            ->active()
            ->exists();
    }

    /**
     * Determine if the organization is on a specific plan.
     */
    public function onPlan($plan): bool
    {
        return $this->subscription_type === $plan;
    }

    /**
     * Determine if the organization is on a trial period.
     */
    public function onTrial(): bool
    {
        return $this->defaultSubscription?->onTrial() ?? false;
    }

    /**
     * Get the active subscription for the organization.
     */
    public function activeSubscription()
    {
        return $this->subscriptions()->active()->first();
    }

    // public function users(): HasMany
    // {
    //     return $this->hasMany(User::class);
    // }
    public function users()
    {
        return $this->belongsToMany(User::class, 'organization_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // Add a primary user/owner method
    public function owner(): HasOne
    {
        return $this->hasOne(User::class)->oldest(); // or use a specific logic to determine owner
    }

    // Organization has many clients
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    // Organization has many proposals
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    // // Subscription helper
    // public function subscriptionActive(): bool
    // {
    //     return $this->subscription('default')?->active() ?? false;
    // }
}
