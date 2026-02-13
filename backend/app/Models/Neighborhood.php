<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Neighborhood extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'city', 'state', 'lga', 'description',
        'latitude', 'longitude', 'avg_rent_price', 'avg_sale_price',
        'safety_rating', 'image_url',
    ];

    protected function casts(): array
    {
        return [
            'latitude'       => 'float',
            'longitude'      => 'float',
            'avg_rent_price' => 'decimal:2',
            'avg_sale_price' => 'decimal:2',
            'safety_rating'  => 'float',
        ];
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
