<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_id',
        'proposal_template_id',
        'title',
        'content',
        'status',
        'secure_link_token',
        'signature',
        'organization_id',
        'project_details',
        'pricing',
       
        'your_name',
        'your_position',
        'your_contact_info',
        'your_company',
        'client_address',
        'client_city_state_zip',
        'signed_data',
        'line_items',
        'signed_ip', 'signed_user_agent',  'image_path'
    ];

    
    protected $casts = [
        'signed_data' => 'array',
        'line_items' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    protected $appends = ['signature_image'];

    public function getSignatureImageAttribute()
    {
        $imagePath = $this->signed_data['image_path'] ?? null;

        if (!$imagePath) return null;

        $fullPath = storage_path('app/public/' . $imagePath);

        if (file_exists($fullPath)) {
            $imageData = base64_encode(file_get_contents($fullPath));
            $mimeType = mime_content_type($fullPath);
            return 'data:' . $mimeType . ';base64,' . $imageData;
        }

        return null;
    }
    
    // Generate a unique secure token when creating a proposal
    protected static function booted()
    {
        static::creating(function ($proposal) {
            $proposal->secure_link_token = Str::uuid()->toString();
            $proposal->view_token = Str::random(16);
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function template()
    {
        return $this->belongsTo(ProposalTemplate::class, 'proposal_template_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
