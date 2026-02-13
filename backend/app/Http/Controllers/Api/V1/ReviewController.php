<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Property $property): JsonResponse
    {
        $reviews = $property->reviews()->with('user')->latest()->paginate(20);

        return $this->paginatedResponse($reviews);
    }

    public function store(Request $request, Property $property): JsonResponse
    {
        $data = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            return $this->errorResponse('You have already reviewed this property', 422);
        }

        $review = Review::create([
            'user_id'     => $request->user()->id,
            'property_id' => $property->id,
            'rating'      => $data['rating'],
            'comment'     => $data['comment'] ?? null,
        ]);

        return $this->successResponse($review->load('user'), 'Review submitted', 201);
    }
}
