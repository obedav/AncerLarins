<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchSuggestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'type'        => $this['type'],
            'id'          => $this['id'],
            'name'        => $this['label'],
            'slug'        => $this['slug'] ?? null,
            'parent_name' => $this['parent_name'] ?? $this['extra'] ?? null,
        ];
    }
}
