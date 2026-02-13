<?php

namespace App\Models;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'price', 'listing_type', 'property_type',
        'status', 'bedrooms', 'bathrooms', 'toilets', 'area_sqm', 'address',
        'city', 'state', 'lga', 'latitude', 'longitude', 'year_built',
        'is_furnished', 'has_parking', 'has_security', 'has_pool', 'has_gym',
        'is_featured', 'is_verified', 'user_id', 'neighborhood_id',
    ];

    protected function casts(): array
    {
        return [
            'price'         => 'decimal:2',
            'listing_type'  => ListingType::class,
            'property_type' => PropertyType::class,
            'status'        => PropertyStatus::class,
            'is_furnished'  => 'boolean',
            'has_parking'   => 'boolean',
            'has_security'  => 'boolean',
            'has_pool'      => 'boolean',
            'has_gym'       => 'boolean',
            'is_featured'   => 'boolean',
            'is_verified'   => 'boolean',
            'latitude'      => 'float',
            'longitude'     => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', PropertyStatus::AVAILABLE);
    }

    public function scopeInLga(Builder $query, string $lga): Builder
    {
        return $query->where('lga', $lga);
    }
}
