<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'organization_id',
        'type',
        'stripe_id',
        'stripe_status',
        'stripe_price',
        'quantity',
        'trial_ends_at',
        'ends_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the organization that owns the subscription.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Determine if the subscription is active.
     */
    public function isActive(): bool
    {
        return $this->stripe_status === 'active' || $this->stripe_status === 'trialing';
    }

    /**
     * Determine if the subscription is within its trial period.
     */
    public function onTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Determine if the subscription is canceled.
     */
    public function isCanceled(): bool
    {
        return $this->stripe_status === 'canceled' || $this->ends_at?->isPast();
    }

    /**
     * Determine if the subscription is past due.
     */
    public function isPastDue(): bool
    {
        return $this->stripe_status === 'past_due';
    }

    /**
     * Determine if the subscription is incomplete.
     */
    public function isIncomplete(): bool
    {
        return $this->stripe_status === 'incomplete';
    }

    /**
     * Determine if the subscription is incomplete and expired.
     */
    public function isIncompleteExpired(): bool
    {
        return $this->stripe_status === 'incomplete_expired';
    }

    /**
     * Scope a query to only include active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($query) {
            $query->where('stripe_status', 'active')
                  ->orWhere('stripe_status', 'trialing');
        })->where(function ($query) {
            $query->whereNull('ends_at')
                  ->orWhere('ends_at', '>', now());
        });
    }

    /**
     * Scope a query to only include subscriptions of a given type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include subscriptions for a given price.
     */
    public function scopeForPrice($query, $priceId)
    {
        return $query->where('stripe_price', $priceId);
    }
}