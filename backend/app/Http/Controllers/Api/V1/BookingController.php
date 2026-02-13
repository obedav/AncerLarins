<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['property.images', 'agent'])
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($bookings);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'property_id'  => 'required|exists:properties,id',
            'scheduled_at' => 'required|date|after:now',
            'notes'        => 'nullable|string|max:500',
        ]);

        $booking = Booking::create([
            'property_id'  => $data['property_id'],
            'user_id'      => $request->user()->id,
            'scheduled_at' => $data['scheduled_at'],
            'notes'        => $data['notes'] ?? null,
            'status'       => 'pending',
        ]);

        return $this->successResponse(
            new BookingResource($booking->load(['property', 'user'])),
            'Booking created',
            201
        );
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id && $booking->agent_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $data = $request->validate([
            'status'       => 'sometimes|in:pending,confirmed,cancelled,completed',
            'scheduled_at' => 'sometimes|date|after:now',
        ]);

        $booking->update($data);

        return $this->successResponse(new BookingResource($booking->fresh(['property', 'user'])), 'Booking updated');
    }
}
