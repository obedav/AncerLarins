<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CooperativeListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            'slug'                      => $this->slug,
            'target_amount_kobo'        => $this->target_amount_kobo,
            'monthly_contribution_kobo' => $this->monthly_contribution_kobo,
            'status'                    => $this->status?->value,
            'member_count'              => $this->member_count,
            'total_contributed_kobo'    => $this->total_contributed_kobo,
            'progress_percentage'       => $this->progress_percentage,
            'area'                      => $this->when(
                $this->relationLoaded('area'),
                fn () => $this->area ? [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                ] : null
            ),
            'created_at'                => $this->created_at?->toISOString(),
        ];
    }
}
