<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'title'                => $this->title,
            'description'          => $this->description,
            'listing_type'         => $this->listing_type?->value,
            'min_bedrooms'         => $this->min_bedrooms,
            'max_bedrooms'         => $this->max_bedrooms,
            'min_price_kobo'       => $this->min_price_kobo,
            'max_price_kobo'       => $this->max_price_kobo,
            'budget_kobo'          => $this->budget_kobo,
            'move_in_date'         => $this->move_in_date?->toDateString(),
            'amenity_preferences'  => $this->amenity_preferences,
            'status'               => $this->status?->value,
            'response_count'       => $this->response_count,
            'expires_at'           => $this->expires_at?->toISOString(),
            'property_type'        => $this->when(
                $this->relationLoaded('propertyType'),
                fn () => [
                    'id'   => $this->propertyType->id,
                    'name' => $this->propertyType->name,
                ]
            ),
            'area'                 => $this->when(
                $this->relationLoaded('area'),
                fn () => [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                    'slug' => $this->area->slug,
                ]
            ),
            'city'                 => $this->when(
                $this->relationLoaded('city'),
                fn () => [
                    'id'   => $this->city->id,
                    'name' => $this->city->name,
                ]
            ),
            'user'                 => $this->when(
                $this->relationLoaded('user'),
                fn () => [
                    'id'        => $this->user->id,
                    'full_name' => $this->user->full_name,
                ]
            ),
            'responses'            => $this->when(
                $this->relationLoaded('responses'),
                fn () => PropertyRequestResponseResource::collection($this->responses)
            ),
            'created_at'           => $this->created_at?->toISOString(),
            'updated_at'           => $this->updated_at?->toISOString(),
        ];
    }
}
