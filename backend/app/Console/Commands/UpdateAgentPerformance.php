<?php

namespace App\Console\Commands;

use App\Models\AgentProfile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateAgentPerformance extends Command
{
    protected $signature = 'agents:update-performance';
    protected $description = 'Recalculate agent performance metrics (response rate, response time, active listings)';

    public function handle(): int
    {
        $agents = AgentProfile::all();

        foreach ($agents as $agent) {
            $leadStats = DB::table('leads')
                ->where('agent_id', $agent->id)
                ->selectRaw('
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN responded_at IS NOT NULL THEN 1 ELSE 0 END) as responded_leads,
                    AVG(EXTRACT(EPOCH FROM (responded_at - created_at))) as avg_response_seconds
                ')
                ->first();

            $activeListings = DB::table('properties')
                ->where('agent_id', $agent->id)
                ->where('status', 'approved')
                ->count();

            $responseRate = $leadStats->total_leads > 0
                ? round(($leadStats->responded_leads / $leadStats->total_leads) * 100, 1)
                : null;

            $avgResponseMinutes = $leadStats->avg_response_seconds
                ? round($leadStats->avg_response_seconds / 60)
                : null;

            $agent->update([
                'response_rate'     => $responseRate,
                'avg_response_time' => $avgResponseMinutes,
                'active_listings'   => $activeListings,
            ]);
        }

        $this->info("Updated performance for {$agents->count()} agents.");

        return self::SUCCESS;
    }
}
