<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_users'            => $this['total_users'] ?? 0,
            'total_agents'           => $this['total_agents'] ?? 0,
            'total_properties'       => $this['total_properties'] ?? 0,
            'pending_properties'     => $this['pending_properties'] ?? 0,
            'pending_agents'         => $this['pending_agents'] ?? 0,
            'total_leads'            => $this['total_leads'] ?? 0,
            'open_reports'           => $this['open_reports'] ?? 0,
            'properties_this_month'  => $this['properties_this_month'] ?? 0,
            'users_this_month'       => $this['users_this_month'] ?? 0,
        ];
    }
}
