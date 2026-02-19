<?php

namespace App\Services;

use App\Enums\PropertyRequestStatus;
use App\Enums\RequestResponseStatus;
use App\Models\AgentProfile;
use App\Models\PropertyRequest;
use App\Models\PropertyRequestResponse;
use App\Models\User;

class PropertyRequestService
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    public function create(array $data, User $user): PropertyRequest
    {
        return PropertyRequest::create(array_merge($data, [
            'user_id'    => $user->id,
            'status'     => PropertyRequestStatus::Active,
            'expires_at' => now()->addDays(30),
        ]));
    }

    public function respond(PropertyRequest $request, AgentProfile $agent, array $data): PropertyRequestResponse
    {
        $response = $request->responses()->create(array_merge($data, [
            'agent_id' => $agent->id,
            'status'   => RequestResponseStatus::Pending,
        ]));

        $request->increment('response_count');

        $this->notificationService->send(
            $request->user,
            'New Response to Your Request',
            "{$agent->company_name} responded to \"{$request->title}\".",
            'request_response',
            [
                'action_type' => 'property_request',
                'action_id'   => $request->id,
            ]
        );

        return $response;
    }

    public function acceptResponse(PropertyRequest $request, PropertyRequestResponse $response): void
    {
        $response->update(['status' => RequestResponseStatus::Accepted]);
        $request->update(['status' => PropertyRequestStatus::Fulfilled]);

        if ($response->agent) {
            $this->notificationService->send(
                $response->agent->user,
                'Response Accepted!',
                "Your response to \"{$request->title}\" was accepted.",
                'request_accepted',
                [
                    'action_type' => 'property_request',
                    'action_id'   => $request->id,
                ]
            );
        }
    }

    public function expireOldRequests(): int
    {
        $expired = PropertyRequest::active()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expired as $request) {
            $request->update(['status' => PropertyRequestStatus::Expired]);

            $this->notificationService->send(
                $request->user,
                'Request Expired',
                "Your property request \"{$request->title}\" has expired.",
                'request_expired'
            );
        }

        return $expired->count();
    }
}
