<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Models\Area;
use App\Models\City;
use App\Models\State;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    use ApiResponse;

    public function states(): JsonResponse
    {
        $states = State::active()->orderBy('name')->get(['id', 'name', 'slug']);

        return $this->successResponse($states);
    }

    public function cities(Request $request): JsonResponse
    {
        $query = City::active()->orderBy('name');

        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        return $this->successResponse($query->get(['id', 'state_id', 'name', 'slug']));
    }

    public function areas(Request $request): JsonResponse
    {
        $query = Area::active()->with('city')->orderBy('name');

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        return $this->successResponse(AreaResource::collection($query->get()));
    }

    public function areaDetail(Area $area): JsonResponse
    {
        $area->load(['city.state', 'landmarks', 'properties' => fn ($q) => $q->approved()->count()]);

        return $this->successResponse(new AreaResource($area));
    }
}
