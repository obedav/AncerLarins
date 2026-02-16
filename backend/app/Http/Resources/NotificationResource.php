<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'body'        => $this->body,
            'type'        => $this->type,
            'action_url'  => $this->action_url,
            'action_type' => $this->action_type,
            'action_id'   => $this->action_id,
            'is_read'     => $this->isRead(),
            'read_at'     => $this->read_at?->toISOString(),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}
