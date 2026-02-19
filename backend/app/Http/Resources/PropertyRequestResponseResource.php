<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyRequestResponseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'message'             => $this->message,
            'proposed_price_kobo' => $this->proposed_price_kobo,
            'status'              => $this->status?->value,
            'agent'               => $this->when(
                $this->relationLoaded('agent'),
                fn () => [
                    'id'           => $this->agent->id,
                    'company_name' => $this->agent->company_name,
                    'logo_url'     => $this->agent->logo_url,
                ]
            ),
            'property'            => $this->when(
                $this->relationLoaded('property'),
                fn () => [
                    'id'    => $this->property->id,
                    'title' => $this->property->title,
                    'slug'  => $this->property->slug,
                ]
            ),
            'created_at'          => $this->created_at?->toISOString(),
        ];
    }
}
