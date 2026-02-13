<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Favorite;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->with('property.images')
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($favorites);
    }

    public function toggle(Request $request, Property $property): JsonResponse
    {
        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return $this->successResponse(null, 'Removed from favorites');
        }

        Favorite::create([
            'user_id'     => $request->user()->id,
            'property_id' => $property->id,
        ]);

        return $this->successResponse(null, 'Added to favorites', 201);
    }
}
