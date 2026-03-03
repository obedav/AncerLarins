<?php

namespace App\Services;

use App\Enums\PropertyStatus;
use App\Enums\UserStatus;
use App\Enums\VerificationStatus;
use App\Jobs\MatchSavedSearchesJob;
use App\Models\ActivityLog;
use App\Models\AgentProfile;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AdminService
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    public function getDashboardStats(): array
    {
        return Cache::remember('admin:dashboard_stats', 30, function () {
            $weekStart = now()->startOfWeek();

            // Single grouped query for properties by status
            $propertiesByStatus = Property::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            // Single grouped query for agents by verification status
            $agentsByVerification = AgentProfile::selectRaw('verification_status, count(*) as total')
                ->groupBy('verification_status')
                ->pluck('total', 'verification_status')
                ->toArray();

            return [
                'total_users'              => User::count(),
                'total_agents'             => array_sum($agentsByVerification),
                'total_properties'         => array_sum($propertiesByStatus),
                'pending_approvals'        => $propertiesByStatus[PropertyStatus::Pending->value] ?? 0,
                'pending_agents'           => $agentsByVerification[VerificationStatus::Pending->value] ?? 0,
                'total_leads'              => Lead::count(),
                'leads_this_week'          => Lead::where('created_at', '>=', $weekStart)->count(),
                'open_reports'             => Report::open()->count(),
                'properties_by_status'     => $propertiesByStatus,
                'agents_by_verification'   => $agentsByVerification,
                'new_listings_this_week'   => Property::where('created_at', '>=', $weekStart)->count(),
                'new_users_this_week'      => User::where('created_at', '>=', $weekStart)->count(),
            ];
        });
    }

    public function approveProperty(Property $property, User $admin): Property
    {
        $previousStatus = $property->status?->value;

        $property->forceFill([
            'status'       => PropertyStatus::Approved,
            'approved_by'  => $admin->id,
            'approved_at'  => now(),
            'published_at' => now(),
            'expires_at'   => now()->addDays(config('ancerlarins.property_expiry_days', 90)),
        ])->save();

        $agentUser = $property->agent?->user;
        if ($agentUser) {
            $this->notificationService->send(
                $agentUser,
                'Property Approved',
                "Your property \"{$property->title}\" has been approved and published.",
                'property_approved',
                ['action_type' => 'property', 'action_id' => $property->id, 'action_url' => "/properties/{$property->slug}"]
            );
        }

        // Match against saved searches asynchronously
        MatchSavedSearchesJob::dispatch($property->id);

        $this->log($admin, 'property_approved', $property, ['previous_status' => $previousStatus]);

        return $property->fresh();
    }

    public function rejectProperty(Property $property, string $reason, User $admin): Property
    {
        $previousStatus = $property->status?->value;

        $property->forceFill([
            'status'           => PropertyStatus::Rejected,
            'rejection_reason' => $reason,
            'approved_by'      => $admin->id,
        ])->save();

        $agentUser = $property->agent?->user;
        if ($agentUser) {
            $this->notificationService->send(
                $agentUser,
                'Property Rejected',
                "Your property \"{$property->title}\" was rejected: {$reason}",
                'property_rejected',
                ['action_type' => 'property', 'action_id' => $property->id]
            );
        }

        $this->log($admin, 'property_rejected', $property, ['reason' => $reason, 'previous_status' => $previousStatus]);

        return $property->fresh();
    }

    public function featureProperty(Property $property, ?int $days = null): Property
    {
        $effectiveDays = $days ?? config('ancerlarins.featured_default_days', 30);

        $property->forceFill([
            'featured'       => true,
            'featured_until' => now()->addDays($effectiveDays),
        ])->save();

        $this->log(request()->user(), 'property_featured', $property, ['days' => $effectiveDays]);

        return $property->fresh();
    }

    public function verifyAgent(AgentProfile $agent, User $admin): void
    {
        $previousStatus = $agent->verification_status?->value;

        $agent->forceFill([
            'verification_status' => VerificationStatus::Verified,
            'verified_at'         => now(),
            'verified_by'         => $admin->id,
        ])->save();

        if ($agent->user) {
            $this->notificationService->send(
                $agent->user,
                'Agent Verified',
                'Your agent profile has been verified. You can now list properties.',
                'agent_verified',
            );
        }

        $this->log($admin, 'agent_verified', $agent, ['previous_status' => $previousStatus]);
    }

    public function rejectAgent(AgentProfile $agent, string $reason, User $admin): void
    {
        $previousStatus = $agent->verification_status?->value;

        $agent->forceFill([
            'verification_status'    => VerificationStatus::Rejected,
            'verification_rejection' => $reason,
        ])->save();

        if ($agent->user) {
            $this->notificationService->send(
                $agent->user,
                'Verification Rejected',
                "Your agent verification was rejected: {$reason}",
                'agent_rejected',
            );
        }

        $this->log($admin, 'agent_rejected', $agent, ['reason' => $reason, 'previous_status' => $previousStatus]);
    }

    public function banUser(User $user, string $reason, User $admin): void
    {
        $previousStatus = $user->status?->value;

        $user->forceFill([
            'status'     => UserStatus::Banned,
            'ban_reason' => $reason,
            'banned_at'  => now(),
            'banned_by'  => $admin->id,
        ])->save();

        $user->tokens()->delete();

        $this->log($admin, 'user_banned', $user, ['reason' => $reason, 'previous_status' => $previousStatus]);
    }

    public function unbanUser(User $user, ?User $admin = null): void
    {
        $previousStatus = $user->status?->value;

        $user->forceFill([
            'status'     => UserStatus::Active,
            'ban_reason' => null,
            'banned_at'  => null,
            'banned_by'  => null,
        ])->save();

        $this->log($admin ?? request()->user(), 'user_unbanned', $user, ['previous_status' => $previousStatus]);
    }

    private function log(?User $admin, string $action, $target, array $metadata = []): void
    {
        ActivityLog::create([
            'user_id'     => $admin?->id,
            'action'      => $action,
            'target_type' => $target->getMorphClass(),
            'target_id'   => $target->getKey(),
            'metadata'    => $metadata,
            'ip_address'  => request()->ip(),
        ]);
    }
}
