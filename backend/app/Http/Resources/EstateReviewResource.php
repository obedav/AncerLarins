<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstateReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'rating'     => $this->rating,
            'pros'       => $this->pros,
            'cons'       => $this->cons,
            'lived_from' => $this->lived_from?->toDateString(),
            'lived_to'   => $this->lived_to?->toDateString(),
            'user'       => $this->when(
                $this->relationLoaded('user'),
                fn () => [
                    'id'        => $this->user->id,
                    'full_name' => $this->user->full_name,
                ]
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
