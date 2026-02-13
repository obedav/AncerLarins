<?php

namespace App\Services;

use App\Enums\ReviewStatus;
use App\Models\AgentProfile;
use App\Models\AgentReview;
use App\Models\User;

class ReviewService
{
    public function create(User $user, array $data): AgentReview
    {
        $review = AgentReview::create(array_merge($data, [
            'user_id' => $user->id,
            'status'  => ReviewStatus::Pending,
        ]));

        return $review;
    }

    public function approve(AgentReview $review): void
    {
        $review->update(['status' => ReviewStatus::Approved]);

        $this->recalculateAgentRating($review->agent_profile_id);
    }

    public function reject(AgentReview $review): void
    {
        $review->update(['status' => ReviewStatus::Rejected]);
    }

    protected function recalculateAgentRating(string $agentProfileId): void
    {
        $stats = AgentReview::where('agent_profile_id', $agentProfileId)
            ->approved()
            ->selectRaw('AVG(overall_rating) as avg_rating, COUNT(*) as total')
            ->first();

        AgentProfile::where('id', $agentProfileId)->update([
            'avg_rating'    => round($stats->avg_rating, 2),
            'total_reviews' => $stats->total,
        ]);
    }
}
