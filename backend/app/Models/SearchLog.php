<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class SearchLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'session_id', 'query_text',
        'listing_type', 'property_type_id', 'city_id', 'area_id',
        'min_price_kobo', 'max_price_kobo', 'bedrooms',
        'filters_json', 'result_count', 'clicked_property_id',
    ];

    protected function casts(): array
    {
        return [
            'min_price_kobo' => 'integer',
            'max_price_kobo' => 'integer',
            'bedrooms'       => 'integer',
            'filters_json'   => 'array',
            'result_count'   => 'integer',
            'created_at'     => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function propertyType(): Relations\BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function city(): Relations\BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function clickedProperty(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class, 'clicked_property_id');
    }
}
