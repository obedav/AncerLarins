<?php

namespace App\Models;

use App\Enums\ListingType;
use App\Enums\PropertyRequestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyRequest extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id', 'title', 'description', 'listing_type',
        'property_type_id', 'area_id', 'city_id',
        'min_bedrooms', 'max_bedrooms',
        'min_price_kobo', 'max_price_kobo', 'budget_kobo',
        'move_in_date', 'amenity_preferences',
        'status', 'response_count', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'listing_type'       => ListingType::class,
            'status'             => PropertyRequestStatus::class,
            'amenity_preferences' => 'array',
            'move_in_date'       => 'date',
            'expires_at'         => 'datetime',
            'min_price_kobo'     => 'integer',
            'max_price_kobo'     => 'integer',
            'budget_kobo'        => 'integer',
            'response_count'     => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function propertyType(): Relations\BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function city(): Relations\BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function responses(): Relations\HasMany
    {
        return $this->hasMany(PropertyRequestResponse::class);
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', PropertyRequestStatus::Active);
    }

    public function scopeByArea(Builder $query, string $areaId): Builder
    {
        return $query->where('area_id', $areaId);
    }

    public function scopeByListingType(Builder $query, ListingType $type): Builder
    {
        return $query->where('listing_type', $type);
    }

    public function scopeExpiringSoon(Builder $query): Builder
    {
        return $query->active()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(7));
    }
}
