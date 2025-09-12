<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredefinedProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'title',
        'content',
        'is_public',
        'is_premium', 'user_id', 'organization_id',
    ];

      // Scope for premium templates
      public function scopePremium($query)
      {
          return $query->where('is_premium', true);
      }
  
      // Scope for user's saved templates
      public function scopeUserTemplates($query, $userId)
      {
          return $query->where('user_id', $userId)->where('is_premium', false);
      }
  
      // Relationship to user
      public function user()
      {
          return $this->belongsTo(User::class);
      }
  
      // Relationship to organization
      public function organization()
      {
          return $this->belongsTo(Organization::class);
      }
}
