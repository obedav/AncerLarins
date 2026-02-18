<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class ExternalPriceData extends Model
{
    use HasUuids;

    protected $table = 'external_price_data';

    protected $fillable = [
        'source', 'area_id', 'property_type', 'bedrooms',
        'price_kobo', 'listing_type', 'data_date',
        'raw_data', 'data_quality',
    ];

    protected function casts(): array
    {
        return [
            'price_kobo'  => 'integer',
            'bedrooms'    => 'integer',
            'raw_data'    => 'array',
            'data_date'   => 'date',
        ];
    }

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}
