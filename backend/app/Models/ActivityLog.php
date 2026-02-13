<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class ActivityLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'target_type', 'target_id',
        'metadata', 'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function target(): Relations\MorphTo
    {
        return $this->morphTo();
    }
}
