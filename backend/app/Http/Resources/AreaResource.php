<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'avg_rent_1br'     => $this->avg_rent_1br,
            'avg_rent_2br'     => $this->avg_rent_2br,
            'avg_rent_3br'     => $this->avg_rent_3br,
            'avg_buy_price_sqm' => $this->avg_buy_price_sqm,
            'safety_score'     => $this->safety_score,
            'traffic_score'    => $this->traffic_score,
            'amenity_score'    => $this->amenity_score,
            'city' => $this->when(
                $this->relationLoaded('city'),
                fn () => [
                    'id'   => $this->city->id,
                    'name' => $this->city->name,
                    'slug' => $this->city->slug,
                ]
            ),
            'landmarks' => $this->when(
                $this->relationLoaded('landmarks'),
                fn () => $this->landmarks->map(fn ($l) => [
                    'id'   => $l->id,
                    'name' => $l->name,
                    'type' => $l->type,
                ])
            ),
            'properties_count' => $this->when(
                isset($this->properties_count),
                $this->properties_count
            ),
        ];
    }
}
