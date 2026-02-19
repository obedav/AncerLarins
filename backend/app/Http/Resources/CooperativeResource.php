<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CooperativeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            'slug'                      => $this->slug,
            'description'               => $this->description,
            'target_amount_kobo'        => $this->target_amount_kobo,
            'monthly_contribution_kobo' => $this->monthly_contribution_kobo,
            'status'                    => $this->status?->value,
            'member_count'              => $this->member_count,
            'total_contributed_kobo'    => $this->total_contributed_kobo,
            'progress_percentage'       => $this->progress_percentage,
            'start_date'                => $this->start_date?->toDateString(),
            'target_date'               => $this->target_date?->toDateString(),
            'admin_user'                => $this->when(
                $this->relationLoaded('adminUser'),
                fn () => [
                    'id'        => $this->adminUser->id,
                    'full_name' => $this->adminUser->full_name,
                ]
            ),
            'area'                      => $this->when(
                $this->relationLoaded('area'),
                fn () => $this->area ? [
                    'id'   => $this->area->id,
                    'name' => $this->area->name,
                ] : null
            ),
            'members'                   => $this->when(
                $this->relationLoaded('members'),
                fn () => CooperativeMemberResource::collection($this->members)
            ),
            'created_at'                => $this->created_at?->toISOString(),
            'updated_at'                => $this->updated_at?->toISOString(),
        ];
    }
}
