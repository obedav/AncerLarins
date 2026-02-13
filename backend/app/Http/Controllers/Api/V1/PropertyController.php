<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Services\CloudinaryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['images', 'user', 'neighborhood'])->available();

        if ($request->filled('city'))          $query->where('city', $request->city);
        if ($request->filled('lga'))           $query->where('lga', $request->lga);
        if ($request->filled('listing_type'))  $query->where('listing_type', $request->listing_type);
        if ($request->filled('property_type')) $query->where('property_type', $request->property_type);
        if ($request->filled('min_price'))     $query->where('price', '>=', $request->min_price);
        if ($request->filled('max_price'))     $query->where('price', '<=', $request->max_price);
        if ($request->filled('bedrooms'))      $query->where('bedrooms', '>=', $request->bedrooms);
        if ($request->boolean('is_furnished')) $query->where('is_furnished', true);

        $properties = $query->latest()->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($properties);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'price'         => 'required|numeric|min:0',
            'listing_type'  => 'required|in:sale,rent,shortlet',
            'property_type' => 'required|in:apartment,house,duplex,bungalow,terrace,penthouse,studio,commercial,land,shortlet',
            'bedrooms'      => 'required|integer|min:0',
            'bathrooms'     => 'required|integer|min:0',
            'toilets'       => 'sometimes|integer|min:0',
            'area_sqm'      => 'nullable|numeric',
            'address'       => 'required|string',
            'city'          => 'sometimes|string',
            'state'         => 'sometimes|string',
            'lga'           => 'required|string',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'year_built'    => 'nullable|integer',
            'is_furnished'  => 'sometimes|boolean',
            'has_parking'   => 'sometimes|boolean',
            'has_security'  => 'sometimes|boolean',
            'has_pool'      => 'sometimes|boolean',
            'has_gym'       => 'sometimes|boolean',
        ]);

        $data['slug']    = Str::slug($data['title']) . '-' . Str::random(6);
        $data['user_id'] = $request->user()->id;
        $data['city']    = $data['city'] ?? 'Lagos';
        $data['state']   = $data['state'] ?? 'Lagos';

        $property = Property::create($data);

        return $this->successResponse(
            new PropertyResource($property->load(['images', 'user'])),
            'Property created',
            201
        );
    }

    public function show(string $slug): JsonResponse
    {
        $property = Property::with(['images', 'user', 'neighborhood', 'reviews.user'])
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->successResponse(new PropertyResource($property));
    }

    public function update(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $data = $request->validate([
            'title'         => 'sometimes|string|max:255',
            'description'   => 'sometimes|string',
            'price'         => 'sometimes|numeric|min:0',
            'listing_type'  => 'sometimes|in:sale,rent,shortlet',
            'property_type' => 'sometimes|in:apartment,house,duplex,bungalow,terrace,penthouse,studio,commercial,land,shortlet',
            'status'        => 'sometimes|in:available,rented,sold,under_offer,delisted',
            'bedrooms'      => 'sometimes|integer|min:0',
            'bathrooms'     => 'sometimes|integer|min:0',
            'toilets'       => 'sometimes|integer|min:0',
            'address'       => 'sometimes|string',
            'lga'           => 'sometimes|string',
            'is_furnished'  => 'sometimes|boolean',
            'has_parking'   => 'sometimes|boolean',
            'has_security'  => 'sometimes|boolean',
        ]);

        $property->update($data);

        return $this->successResponse(new PropertyResource($property->fresh(['images', 'user'])), 'Property updated');
    }

    public function destroy(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $property->delete();

        return $this->successResponse(null, 'Property deleted');
    }

    public function uploadImages(Request $request, Property $property, CloudinaryService $cloudinary): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $request->validate(['images' => 'required|array|max:10', 'images.*' => 'image|max:5120']);

        $results = $cloudinary->uploadMultiple($request->file('images'));
        $isFirst = $property->images()->count() === 0;

        foreach ($results as $i => $result) {
            if ($result['url']) {
                $property->images()->create([
                    'image_url'  => $result['url'],
                    'public_id'  => $result['public_id'],
                    'is_primary' => $isFirst && $i === 0,
                    'sort_order' => $i,
                ]);
            }
        }

        return $this->successResponse($property->fresh('images'), 'Images uploaded');
    }

    public function featured(): JsonResponse
    {
        $properties = Property::with(['images', 'user'])
            ->available()
            ->where('is_featured', true)
            ->latest()
            ->limit(12)
            ->get();

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function myProperties(Request $request): JsonResponse
    {
        $properties = $request->user()
            ->properties()
            ->with('images')
            ->latest()
            ->paginate(20);

        return $this->paginatedResponse($properties);
    }
}
