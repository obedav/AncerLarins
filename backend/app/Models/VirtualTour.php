<?php

namespace App\Models;

use App\Enums\TourType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class VirtualTour extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'property_id', 'tour_type', 'url', 'thumbnail_url',
        'duration_seconds', 'view_count',
    ];

    protected function casts(): array
    {
        return [
            'tour_type'        => TourType::class,
            'duration_seconds' => 'integer',
            'view_count'       => 'integer',
            'created_at'       => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    // ── Helpers ──────────────────────────────────────────

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }
}
