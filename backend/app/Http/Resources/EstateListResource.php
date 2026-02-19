<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstateListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'slug'                  => $this->slug,
            'estate_type'           => $this->estate_type?->value,
            'security_type'         => $this->security_type,
            'service_charge_kobo'   => $this->service_charge_kobo,
            'service_charge_period' => $this->service_charge_period,
            'cover_image_url'       => $this->cover_image_url,
            'avg_rating'            => $this->avg_rating,
            'reviews_count'         => $this->when(isset($this->reviews_count), $this->reviews_count),
            'properties_count'      => $this->when(isset($this->properties_count), $this->properties_count),
            'area'                  => $this->when(
                $this->relationLoaded('area'),
                fn () => [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                ]
            ),
        ];
    }
}
