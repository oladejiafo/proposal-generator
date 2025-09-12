<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'position',
        'phone', 
        'contact_info',
        'logo_path',
        'organization_id', // <--- important!
    ];

    protected $appends = ['logo_url'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getLogoUrlAttribute()
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    // User owns one organization
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // User has many clients (through organization)
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    // User has many proposals (through organization)
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    // User has many templates
    public function templates(): HasMany
    {
        return $this->hasMany(ProposalTemplate::class);
    }

    // Current organization from session
    public function currentOrganization(): ?Organization
    {
        $orgId = session('current_organization_id');
        return $orgId ? Organization::find($orgId) : $this->organization;
    }

    // Add subscriptions relationship
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
