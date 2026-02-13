<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Services\GeoSearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function search(Request $request): JsonResponse
    {
        $query = Property::with(['images', 'user'])->available();

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($qb) use ($q) {
                $qb->where('title', 'ILIKE', "%{$q}%")
                    ->orWhere('address', 'ILIKE', "%{$q}%")
                    ->orWhere('lga', 'ILIKE', "%{$q}%")
                    ->orWhere('description', 'ILIKE', "%{$q}%");
            });
        }

        if ($request->filled('listing_type'))  $query->where('listing_type', $request->listing_type);
        if ($request->filled('property_type')) $query->where('property_type', $request->property_type);
        if ($request->filled('city'))          $query->where('city', $request->city);
        if ($request->filled('lga'))           $query->where('lga', $request->lga);
        if ($request->filled('min_price'))     $query->where('price', '>=', $request->min_price);
        if ($request->filled('max_price'))     $query->where('price', '<=', $request->max_price);
        if ($request->filled('bedrooms'))      $query->where('bedrooms', '>=', $request->bedrooms);

        $properties = $query->latest()->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($properties);
    }

    public function nearby(Request $request, GeoSearchService $geoSearch): JsonResponse
    {
        $request->validate([
            'lat'    => 'required|numeric',
            'lng'    => 'required|numeric',
            'radius' => 'sometimes|numeric|min:1|max:50',
        ]);

        $properties = $geoSearch->searchNearby(
            $request->float('lat'),
            $request->float('lng'),
            $request->float('radius', 5)
        )->with(['images', 'user'])->available()->paginate(20);

        return $this->paginatedResponse($properties);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);

        $results = Property::select('title', 'slug', 'address', 'lga', 'city')
            ->available()
            ->where('title', 'ILIKE', "%{$request->q}%")
            ->orWhere('address', 'ILIKE', "%{$request->q}%")
            ->limit(10)
            ->get();

        return $this->successResponse($results);
    }
}
