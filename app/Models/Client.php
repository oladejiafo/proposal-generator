<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Client extends Model
{
    //

    protected $fillable = ['name', 'email', 'phone', 'address','company','notes',  'organization_id',]; // whatever fields you send

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
