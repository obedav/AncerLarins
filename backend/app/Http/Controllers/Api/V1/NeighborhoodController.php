<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class NeighborhoodController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $neighborhoods = Neighborhood::withCount('properties')->orderBy('name')->get();

        return $this->successResponse(NeighborhoodResource::collection($neighborhoods));
    }

    public function show(string $slug): JsonResponse
    {
        $neighborhood = Neighborhood::where('slug', $slug)
            ->withCount('properties')
            ->firstOrFail();

        $neighborhood->load(['properties' => fn ($q) => $q->with('images')->available()->latest()->limit(12)]);

        return $this->successResponse(new NeighborhoodResource($neighborhood));
    }
}
