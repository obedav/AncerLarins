<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NeighborhoodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'city' => $this->city,
            'state' => $this->state,
            'lga' => $this->lga,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'avg_rent_price' => $this->avg_rent_price,
            'avg_sale_price' => $this->avg_sale_price,
            'formatted_avg_rent' => $this->avg_rent_price ? '₦' . number_format($this->avg_rent_price) : null,
            'formatted_avg_sale' => $this->avg_sale_price ? '₦' . number_format($this->avg_sale_price) : null,
            'safety_rating' => $this->safety_rating,
            'image_url' => $this->image_url,
            'properties_count' => $this->whenCounted('properties'),
        ];
    }
}
