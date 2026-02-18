<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScrapedListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'source'        => $this->source,
            'source_url'    => $this->source_url,
            'title'         => $this->title,
            'price_kobo'    => $this->price_kobo,
            'location'      => $this->location,
            'bedrooms'      => $this->bedrooms,
            'property_type' => $this->property_type,
            'listing_type'  => $this->listing_type,
            'image_url'     => $this->image_url,
            'status'        => $this->status,
            'dedup_score'   => $this->dedup_score,
            'matched_property_id' => $this->matched_property_id,
            'rejection_reason'    => $this->rejection_reason,
            'created_at'    => $this->created_at?->toISOString(),
        ];
    }
}
