<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'slug'                  => $this->slug,
            'description'           => $this->description,
            'estate_type'           => $this->estate_type?->value,
            'developer'             => $this->developer,
            'year_built'            => $this->year_built,
            'total_units'           => $this->total_units,
            'amenities'             => $this->amenities,
            'security_type'         => $this->security_type,
            'service_charge_kobo'   => $this->service_charge_kobo,
            'service_charge_period' => $this->service_charge_period,
            'electricity_source'    => $this->electricity_source,
            'water_source'          => $this->water_source,
            'cover_image_url'       => $this->cover_image_url,
            'avg_rating'            => $this->avg_rating,
            'reviews_count'         => $this->when(isset($this->reviews_count), $this->reviews_count),
            'properties_count'      => $this->when(isset($this->properties_count), $this->properties_count),
            'area'                  => $this->when(
                $this->relationLoaded('area'),
                fn () => [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                    'slug' => $this->area->slug,
                ]
            ),
            'reviews'               => $this->when(
                $this->relationLoaded('reviews'),
                fn () => EstateReviewResource::collection($this->reviews)
            ),
            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}
