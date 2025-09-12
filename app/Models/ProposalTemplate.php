<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'content',
        'is_public',
        'user_id'
    ];

    // Relationships
    public function proposals()
    {
        return $this->hasMany(Proposal::class, 'proposal_template_id');
    }
}
