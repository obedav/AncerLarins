<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'contact_type' => $this->contact_type,
            'source'       => $this->source,
            'responded_at' => $this->responded_at?->toISOString(),
            'property'     => $this->when(
                $this->relationLoaded('property'),
                fn () => [
                    'id'    => $this->property->id,
                    'title' => $this->property->title,
                    'slug'  => $this->property->slug,
                    'cover_image' => $this->property->coverImage ? [
                        'url'           => $this->property->coverImage->url,
                        'thumbnail_url' => $this->property->coverImage->thumbnail_url,
                    ] : null,
                ]
            ),
            'user' => $this->when(
                $this->relationLoaded('user'),
                fn () => $this->user ? [
                    'id'        => $this->user->id,
                    'full_name' => $this->user->full_name,
                    'phone'     => $this->user->phone,
                ] : null
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
