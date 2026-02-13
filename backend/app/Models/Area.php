<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;
use Illuminate\Support\Facades\DB;

class Area extends Model
{
    use HasUuids;

    protected $fillable = [
        'city_id', 'name', 'slug', 'description',
        'avg_rent_1br', 'avg_rent_2br', 'avg_rent_3br', 'avg_buy_price_sqm',
        'safety_score', 'traffic_score', 'amenity_score', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'avg_rent_1br'     => 'integer',
            'avg_rent_2br'     => 'integer',
            'avg_rent_3br'     => 'integer',
            'avg_buy_price_sqm'=> 'integer',
            'safety_score'     => 'decimal:1',
            'traffic_score'    => 'decimal:1',
            'amenity_score'    => 'decimal:1',
            'is_active'        => 'boolean',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function city(): Relations\BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function landmarks(): Relations\HasMany
    {
        return $this->hasMany(Landmark::class);
    }

    public function properties(): Relations\HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function neighborhoodReviews(): Relations\HasMany
    {
        return $this->hasMany(NeighborhoodReview::class);
    }

    public function agentProfiles(): Relations\HasMany
    {
        return $this->hasMany(AgentProfile::class, 'office_area_id');
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInCity(Builder $query, string $cityId): Builder
    {
        return $query->where('city_id', $cityId);
    }

    public function scopeNearby(Builder $query, float $lat, float $lng, int $radiusKm = 5): Builder
    {
        return $query->whereNotNull('location')
            ->whereRaw(
                'ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
                [$lng, $lat, $radiusKm * 1000]
            );
    }

    // ── Location helpers ─────────────────────────────────

    public function setLocation(float $lat, float $lng): void
    {
        DB::statement(
            'UPDATE areas SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
            [$lng, $lat, $this->id]
        );
    }

    public function getLatitudeAttribute(): ?float
    {
        if (! $this->attributes['location']) return null;
        return DB::selectOne('SELECT ST_Y(location::geometry) AS lat FROM areas WHERE id = ?', [$this->id])?->lat;
    }

    public function getLongitudeAttribute(): ?float
    {
        if (! $this->attributes['location']) return null;
        return DB::selectOne('SELECT ST_X(location::geometry) AS lng FROM areas WHERE id = ?', [$this->id])?->lng;
    }
}
