<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CooperativeMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'role'                   => $this->role?->value,
            'status'                 => $this->status?->value,
            'total_contributed_kobo' => $this->total_contributed_kobo,
            'joined_at'              => $this->joined_at?->toISOString(),
            'user'                   => $this->when(
                $this->relationLoaded('user'),
                fn () => [
                    'id'        => $this->user->id,
                    'full_name' => $this->user->full_name,
                ]
            ),
        ];
    }
}
