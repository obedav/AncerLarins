<?php

namespace App\Http\Requests\PropertyRequest;

use App\Enums\ListingType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePropertyRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:255'],
            'description'         => ['required', 'string', 'max:2000'],
            'listing_type'        => ['required', Rule::in(array_column(ListingType::cases(), 'value'))],
            'property_type_id'    => ['nullable', 'uuid', 'exists:property_types,id'],
            'area_id'             => ['nullable', 'uuid', 'exists:areas,id'],
            'city_id'             => ['nullable', 'uuid', 'exists:cities,id'],
            'min_bedrooms'        => ['nullable', 'integer', 'min:0', 'max:20'],
            'max_bedrooms'        => ['nullable', 'integer', 'min:0', 'max:20', 'gte:min_bedrooms'],
            'min_price_kobo'      => ['nullable', 'integer', 'min:0'],
            'max_price_kobo'      => ['nullable', 'integer', 'min:0', 'gte:min_price_kobo'],
            'budget_kobo'         => ['nullable', 'integer', 'min:0'],
            'move_in_date'        => ['nullable', 'date', 'after_or_equal:today'],
            'amenity_preferences' => ['nullable', 'array'],
            'amenity_preferences.*' => ['string', 'max:100'],
        ];
    }
}
