<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EstateType;
use App\Http\Controllers\Controller;
use App\Http\Resources\EstateListResource;
use App\Http\Resources\EstateResource;
use App\Http\Resources\EstateReviewResource;
use App\Models\Estate;
use App\Models\EstateReview;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Estates
 *
 * Browse and manage estate developments.
 */
class EstateController extends Controller
{
    use ApiResponse;

    /**
     * Public: browse estates.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Estate::with('area')
            ->withAvgRating()
            ->withCount(['reviews', 'properties'])
            ->latest();

        if ($request->filled('area_id')) {
            $query->byArea($request->input('area_id'));
        }

        if ($request->filled('estate_type')) {
            $type = EstateType::tryFrom($request->input('estate_type'));
            if ($type) {
                $query->byType($type);
            }
        }

        if ($request->filled('q')) {
            $query->where('name', 'ilike', '%' . $request->input('q') . '%');
        }

        $estates = $query->paginate($request->input('per_page', 15));

        return $this->paginatedResponse(
            $estates->through(fn ($e) => new EstateListResource($e)),
            'Estates retrieved.'
        );
    }

    /**
     * Public: single estate by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $estate = Estate::where('slug', $slug)
            ->with(['area', 'reviews.user'])
            ->withAvgRating()
            ->withCount(['reviews', 'properties'])
            ->first();

        if (! $estate) {
            return $this->errorResponse('Estate not found.', 404);
        }

        return $this->successResponse(new EstateResource($estate));
    }

    /**
     * Auth: create a review for an estate.
     */
    public function createReview(Request $request, Estate $estate): JsonResponse
    {
        $validated = $request->validate([
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'pros'       => ['nullable', 'string', 'max:2000'],
            'cons'       => ['nullable', 'string', 'max:2000'],
            'lived_from' => ['nullable', 'date'],
            'lived_to'   => ['nullable', 'date', 'after_or_equal:lived_from'],
        ]);

        $existing = EstateReview::where('estate_id', $estate->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($existing) {
            return $this->errorResponse('You have already reviewed this estate.', 422);
        }

        $review = $estate->reviews()->create(array_merge($validated, [
            'user_id' => $request->user()->id,
        ]));

        $review->load('user');

        return $this->successResponse(new EstateReviewResource($review), 'Review submitted.', 201);
    }

    // ── Admin ─────────────────────────────────────────────

    /**
     * Admin: list all estates (no published filter).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Estate::with('area')
            ->withCount(['reviews', 'properties'])
            ->latest();

        if ($request->filled('area_id')) {
            $query->byArea($request->input('area_id'));
        }

        if ($request->filled('estate_type')) {
            $type = EstateType::tryFrom($request->input('estate_type'));
            if ($type) {
                $query->byType($type);
            }
        }

        if ($request->filled('q')) {
            $query->where('name', 'ilike', '%' . $request->input('q') . '%');
        }

        $estates = $query->paginate($request->input('per_page', 20));

        return $this->paginatedResponse(
            $estates->through(fn ($e) => new EstateListResource($e)),
            'Estates retrieved.'
        );
    }

    /** @authenticated */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'area_id'               => ['required', 'uuid', 'exists:areas,id'],
            'description'           => ['nullable', 'string'],
            'estate_type'           => ['required', 'string'],
            'developer'             => ['nullable', 'string', 'max:255'],
            'year_built'            => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'total_units'           => ['nullable', 'integer', 'min:1'],
            'amenities'             => ['nullable', 'array'],
            'security_type'         => ['nullable', 'string', 'max:255'],
            'service_charge_kobo'   => ['nullable', 'integer', 'min:0'],
            'service_charge_period' => ['nullable', 'string'],
            'electricity_source'    => ['nullable', 'string', 'max:255'],
            'water_source'          => ['nullable', 'string', 'max:255'],
            'cover_image_url'       => ['nullable', 'url', 'max:2048'],
        ]);

        $validated['slug'] = str($validated['name'])->slug()->toString();

        // Ensure unique slug
        $base = $validated['slug'];
        $i = 1;
        while (Estate::withTrashed()->where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = "{$base}-{$i}";
            $i++;
        }

        $estate = Estate::create($validated);
        $estate->load('area');

        return $this->successResponse(new EstateResource($estate), 'Estate created.', 201);
    }

    /** @authenticated */
    public function update(Request $request, Estate $estate): JsonResponse
    {
        $validated = $request->validate([
            'name'                  => ['sometimes', 'string', 'max:255'],
            'area_id'               => ['sometimes', 'uuid', 'exists:areas,id'],
            'description'           => ['nullable', 'string'],
            'estate_type'           => ['sometimes', 'string'],
            'developer'             => ['nullable', 'string', 'max:255'],
            'year_built'            => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'total_units'           => ['nullable', 'integer', 'min:1'],
            'amenities'             => ['nullable', 'array'],
            'security_type'         => ['nullable', 'string', 'max:255'],
            'service_charge_kobo'   => ['nullable', 'integer', 'min:0'],
            'service_charge_period' => ['nullable', 'string'],
            'electricity_source'    => ['nullable', 'string', 'max:255'],
            'water_source'          => ['nullable', 'string', 'max:255'],
            'cover_image_url'       => ['nullable', 'url', 'max:2048'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $estate->name) {
            $slug = str($validated['name'])->slug()->toString();
            $base = $slug;
            $i = 1;
            while (Estate::withTrashed()->where('slug', $slug)->where('id', '!=', $estate->id)->exists()) {
                $slug = "{$base}-{$i}";
                $i++;
            }
            $validated['slug'] = $slug;
        }

        $estate->update($validated);
        $estate->load('area');

        return $this->successResponse(new EstateResource($estate), 'Estate updated.');
    }

    /** @authenticated */
    public function destroy(Estate $estate): JsonResponse
    {
        $estate->delete();

        return $this->successResponse(null, 'Estate deleted.', 204);
    }
}
