<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\SearchPropertyRequest;
use App\Http\Resources\PropertyListResource;
use App\Http\Resources\SearchSuggestionResource;
use App\Services\SearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SearchService $searchService,
    ) {}

    public function index(SearchPropertyRequest $request): JsonResponse
    {
        $data = $this->searchService->search(
            $request->validated(),
            $request->user()?->id,
        );

        $results = $data['results'];

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data'    => $results->getCollection()->map(fn ($p) => new PropertyListResource($p)),
            'meta'    => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
            ],
            'facets'  => $data['facets'],
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);

        $results = $this->searchService->suggestions($request->q);

        return $this->successResponse(
            SearchSuggestionResource::collection(collect($results))
        );
    }

    public function map(Request $request): JsonResponse
    {
        $request->validate([
            'north' => 'required|numeric|between:-90,90',
            'south' => 'required|numeric|between:-90,90',
            'east'  => 'required|numeric|between:-180,180',
            'west'  => 'required|numeric|between:-180,180',
        ]);

        $properties = $this->searchService->mapSearch(
            $request->float('north'),
            $request->float('south'),
            $request->float('east'),
            $request->float('west'),
            $request->only(['listing_type', 'property_type_id', 'min_price', 'max_price']),
        );

        return $this->successResponse($properties);
    }
}
