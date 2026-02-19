<?php

namespace App\Services;

use App\Enums\ContributionStatus;
use App\Enums\CooperativeMemberRole;
use App\Enums\CooperativeMemberStatus;
use App\Enums\CooperativeStatus;
use App\Models\Cooperative;
use App\Models\CooperativeContribution;
use App\Models\CooperativeMember;
use App\Models\User;
use Illuminate\Support\Str;

class CooperativeService
{
    public function __construct(
        protected PaystackService $paystackService,
        protected NotificationService $notificationService,
    ) {}

    public function create(array $data, User $user): Cooperative
    {
        $slug = Str::slug($data['name']);
        $base = $slug;
        $i = 1;
        while (Cooperative::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        $cooperative = Cooperative::create(array_merge($data, [
            'slug'          => $slug,
            'admin_user_id' => $user->id,
            'status'        => CooperativeStatus::Forming,
            'member_count'  => 1,
        ]));

        // Add creator as admin member
        $cooperative->members()->create([
            'user_id'   => $user->id,
            'role'      => CooperativeMemberRole::Admin,
            'joined_at' => now(),
            'status'    => CooperativeMemberStatus::Active,
        ]);

        return $cooperative;
    }

    public function join(Cooperative $cooperative, User $user): CooperativeMember
    {
        $member = $cooperative->members()->create([
            'user_id'   => $user->id,
            'role'      => CooperativeMemberRole::Member,
            'joined_at' => now(),
            'status'    => CooperativeMemberStatus::Active,
        ]);

        $cooperative->increment('member_count');

        // Notify admin
        $this->notificationService->send(
            $cooperative->adminUser,
            'New Member Joined',
            "{$user->full_name} joined \"{$cooperative->name}\".",
            'cooperative_member_joined',
            [
                'action_type' => 'cooperative',
                'action_id'   => $cooperative->id,
            ]
        );

        return $member;
    }

    public function initializeContribution(Cooperative $cooperative, CooperativeMember $member, int $amountKobo): array
    {
        $reference = 'coop_' . Str::uuid();

        $contribution = $cooperative->contributions()->create([
            'member_id'         => $member->id,
            'amount_kobo'       => $amountKobo,
            'payment_reference' => $reference,
            'payment_method'    => 'paystack',
            'status'            => ContributionStatus::Pending,
            'contributed_at'    => now(),
        ]);

        $result = $this->paystackService->initializeTransaction(
            $member->user->email,
            $amountKobo,
            $reference,
            [
                'type'            => 'cooperative_contribution',
                'cooperative_id'  => $cooperative->id,
                'contribution_id' => $contribution->id,
                'member_id'       => $member->id,
            ]
        );

        return [
            'contribution' => $contribution,
            'paystack'     => $result,
        ];
    }

    public function verifyContribution(string $reference): ?CooperativeContribution
    {
        $contribution = CooperativeContribution::where('payment_reference', $reference)->first();

        if (! $contribution || $contribution->status !== ContributionStatus::Pending) {
            return null;
        }

        $result = $this->paystackService->verifyTransaction($reference);

        if (($result['data']['status'] ?? null) === 'success') {
            $contribution->update([
                'status'      => ContributionStatus::Verified,
                'verified_at' => now(),
            ]);

            // Update member total
            $contribution->member->increment('total_contributed_kobo', $contribution->amount_kobo);

            // Check if target reached
            $cooperative = $contribution->cooperative;
            if ($cooperative->total_contributed_kobo >= $cooperative->target_amount_kobo) {
                $cooperative->update(['status' => CooperativeStatus::TargetReached]);

                $this->notificationService->send(
                    $cooperative->adminUser,
                    'Target Reached!',
                    "Your cooperative \"{$cooperative->name}\" has reached its target!",
                    'cooperative_target_reached',
                    [
                        'action_type' => 'cooperative',
                        'action_id'   => $cooperative->id,
                    ]
                );
            }

            return $contribution;
        }

        $contribution->update(['status' => ContributionStatus::Failed]);

        return $contribution;
    }

    public function getProgress(Cooperative $cooperative): array
    {
        return [
            'target_amount_kobo'      => $cooperative->target_amount_kobo,
            'total_contributed_kobo'  => $cooperative->total_contributed_kobo,
            'progress_percentage'     => $cooperative->progress_percentage,
            'member_count'            => $cooperative->member_count,
        ];
    }
}
