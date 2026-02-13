<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavedSearch\CreateSavedSearchRequest;
use App\Http\Resources\NotificationResource;
use App\Http\Resources\PropertyListResource;
use App\Http\Resources\UserResource;
use App\Models\Notification;
use App\Models\SavedSearch;
use App\Services\NotificationService;
use App\Services\SavedSearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SavedSearchService $savedSearchService,
        protected NotificationService $notificationService,
    ) {}

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            new UserResource($request->user()->load('agentProfile'))
        );
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name'        => 'sometimes|string|max:100',
            'last_name'         => 'sometimes|string|max:100',
            'email'             => 'nullable|email|unique:users,email,' . $request->user()->id,
            'avatar_url'        => 'nullable|url',
            'preferred_city_id' => 'nullable|uuid|exists:cities,id',
        ]);

        $request->user()->update($data);

        return $this->successResponse(
            new UserResource($request->user()->fresh()),
            'Profile updated.'
        );
    }

    public function savedProperties(Request $request): JsonResponse
    {
        $saved = $request->user()
            ->savedProperties()
            ->with(['property.propertyType', 'property.city', 'property.images', 'property.agent.user'])
            ->latest('created_at')
            ->paginate(20);

        $items = $saved->getCollection()->map(fn ($s) => new PropertyListResource($s->property));

        return $this->paginatedResponse($saved->setCollection($items));
    }

    public function savedSearches(Request $request): JsonResponse
    {
        $searches = $request->user()
            ->savedSearches()
            ->with(['propertyType', 'city'])
            ->latest()
            ->get();

        return $this->successResponse($searches);
    }

    public function createSavedSearch(CreateSavedSearchRequest $request): JsonResponse
    {
        $search = $this->savedSearchService->create($request->user(), $request->validated());

        return $this->successResponse($search, 'Saved search created.', 201);
    }

    public function deleteSavedSearch(SavedSearch $savedSearch, Request $request): JsonResponse
    {
        if ($savedSearch->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        $this->savedSearchService->delete($savedSearch);

        return $this->successResponse(null, 'Saved search deleted.');
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse(
            $notifications->setCollection(
                $notifications->getCollection()->map(fn ($n) => new NotificationResource($n))
            )
        );
    }

    public function markNotificationRead(Notification $notification, Request $request): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        $this->notificationService->markAsRead($notification);

        return $this->successResponse(null, 'Notification marked as read.');
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user()->id);

        return $this->successResponse(null, 'All notifications marked as read.');
    }
}
