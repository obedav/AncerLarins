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
        $results = $this->searchService->search(
            $request->validated(),
            $request->user()?->id,
        );

        return $this->paginatedResponse(
            $results->setCollection(
                $results->getCollection()->map(fn ($p) => new PropertyListResource($p))
            )
        );
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
