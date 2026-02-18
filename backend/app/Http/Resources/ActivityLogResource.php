<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user'        => $this->whenLoaded('user', fn () => [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
                'role'      => $this->user->role,
            ]),
            'action'      => $this->action,
            'target_type' => $this->target_type,
            'target_id'   => $this->target_id,
            'metadata'    => $this->metadata,
            'ip_address'  => $this->ip_address,
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}
