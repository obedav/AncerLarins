<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class PropertyView extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'property_id', 'user_id', 'session_id',
        'source', 'device_type', 'duration_seconds',
        'viewed_images', 'contacted_agent', 'saved',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'viewed_images'    => 'boolean',
            'contacted_agent'  => 'boolean',
            'saved'            => 'boolean',
            'created_at'       => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
