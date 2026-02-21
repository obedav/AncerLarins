<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Landmark;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Landmarks
 *
 * Browse and search nearby landmarks.
 */
class LandmarkController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Landmark::with('area:id,name,slug');

        if ($request->filled('area_id')) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $landmarks = $query->orderBy('name')->get(['id', 'area_id', 'name', 'type']);

        return $this->successResponse($landmarks);
    }

    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'lat'    => 'required|numeric|between:-90,90',
            'lng'    => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.5|max:20',
        ]);

        $lat = $request->float('lat');
        $lng = $request->float('lng');
        $radiusKm = $request->float('radius', 5);
        $radiusMetres = $radiusKm * 1000;

        $landmarks = Landmark::whereNotNull('location')
            ->whereRaw(
                'ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
                [$lng, $lat, $radiusMetres]
            )
            ->selectRaw(
                '*, ROUND(CAST(ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 AS numeric), 1) AS distance_km',
                [$lng, $lat]
            )
            ->orderBy('distance_km')
            ->limit(10)
            ->get();

        return $this->successResponse($landmarks->map(fn ($l) => [
            'id'          => $l->id,
            'name'        => $l->name,
            'type'        => $l->type,
            'distance_km' => (float) $l->distance_km,
        ]));
    }
}
