<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class NeighborhoodReview extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'area_id', 'user_id',
        'overall', 'safety', 'transport', 'amenities', 'noise',
        'comment', 'lived_duration', 'status',
    ];

    protected function casts(): array
    {
        return [
            'overall'   => 'decimal:1',
            'safety'    => 'decimal:1',
            'transport' => 'decimal:1',
            'amenities' => 'decimal:1',
            'noise'     => 'decimal:1',
            'status'    => ReviewStatus::class,
            'created_at'=> 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', ReviewStatus::Approved);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ReviewStatus::Pending);
    }
}
