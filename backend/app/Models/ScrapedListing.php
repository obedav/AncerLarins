<?php

namespace App\Models;

use App\Enums\ScrapedListingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class ScrapedListing extends Model
{
    use HasUuids;

    protected $fillable = [
        'source', 'source_url', 'source_id', 'raw_data',
        'title', 'price_kobo', 'location', 'bedrooms',
        'property_type', 'listing_type', 'image_url',
        'status', 'matched_property_id', 'dedup_score',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'raw_data'   => 'array',
            'price_kobo' => 'integer',
            'bedrooms'   => 'integer',
            'status'     => ScrapedListingStatus::class,
            'dedup_score' => 'decimal:4',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function matchedProperty(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class, 'matched_property_id');
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ScrapedListingStatus::Pending);
    }

    public function scopeBySource(Builder $query, string $source): Builder
    {
        return $query->where('source', $source);
    }
}
