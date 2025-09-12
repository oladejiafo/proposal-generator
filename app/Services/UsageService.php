<?php

namespace App\Services;

use App\Models\Organization;
use Carbon\Carbon;

class UsageService
{
    public static function checkLimit(Organization $organization, string $type): bool
    {
        // Reset only proposals and clients monthly
        if (in_array($type, ['proposals', 'clients'])) {
            self::resetMonthlyUsageIfNeeded($organization);
        }

        if ($organization->subscription_type === 'free') {
            return match($type) {
                'proposals' => $organization->proposals_used_this_month < $organization->monthly_proposal_limit,
                'clients' => $organization->clients_used_this_month < $organization->monthly_clients_limit,
                'templates' => $organization->templates_used < $organization->templates_limit, // lifetime
                default => true
            };
        }

        return true; // Unlimited for paid
    }

    public static function incrementUsage(Organization $organization, string $type): void
    {
        if (in_array($type, ['proposals', 'clients'])) {
            self::resetMonthlyUsageIfNeeded($organization);
        }

        match($type) {
            'proposals' => $organization->increment('proposals_used_this_month'),
            'clients' => $organization->increment('clients_used'),
            'templates' => $organization->increment('templates_used'),
            default => null
        };
        
        $organization->refresh();
    }

    public static function getUsageStats(Organization $organization): array
    {
        self::resetMonthlyUsageIfNeeded($organization);
        
        return [
            'proposals' => [
                'used' => $organization->proposals_used_this_month,
                'limit' => $organization->monthly_proposal_limit,
                'remaining' => max(0, $organization->monthly_proposal_limit - $organization->proposals_used_this_month),
                'percentage' => min(100, ($organization->proposals_used_this_month / $organization->monthly_proposal_limit) * 100)
            ],
            'templates' => [
                'used' => $organization->templates_used,
                'limit' => $organization->templates_limit,
                'remaining' => max(0, $organization->templates_limit - $organization->templates_used),
                'percentage' => $organization->templates_limit > 0 ? min(100, ($organization->templates_used / $organization->templates_limit) * 100) : 0
            ],
            'clients' => [
                'used' => $organization->clients_used,
                'limit' => $organization->clients_limit,
                'remaining' => max(0, $organization->clients_limit - $organization->clients_used),
                'percentage' => $organization->clients_limit > 0 ? min(100, ($organization->clients_used / $organization->clients_limit) * 100) : 0
            ]
        ];
    }

    private static function resetMonthlyUsageIfNeeded(Organization $organization): void
    {
        $now = now();
        $resetDate = $organization->usage_reset_at ?: $organization->created_at;

        if ($resetDate->month !== $now->month || $resetDate->year !== $now->year) {
            $organization->update([
                'proposals_used_this_month' => 0,
                'clients_used_this_month' => 0,
                'usage_reset_at' => $now
            ]);
            $organization->refresh();
        }
    }

}