<?php

namespace App\Http\Requests\Property;

use App\Enums\Furnishing;
use App\Enums\ListingType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q'                => ['nullable', 'string', 'max:200'],
            'listing_type'     => ['nullable', Rule::in(array_column(ListingType::cases(), 'value'))],
            'property_type_id' => ['nullable', 'uuid', 'exists:property_types,id'],
            'state_id'         => ['nullable', 'uuid', 'exists:states,id'],
            'city_id'          => ['nullable', 'uuid', 'exists:cities,id'],
            'area_id'          => ['nullable', 'uuid', 'exists:areas,id'],
            'min_price'        => ['nullable', 'integer', 'min:0'],
            'max_price'        => ['nullable', 'integer', 'min:0'],
            'min_bedrooms'     => ['nullable', 'integer', 'min:0'],
            'max_bedrooms'     => ['nullable', 'integer', 'min:0'],
            'min_bathrooms'    => ['nullable', 'integer', 'min:0'],
            'furnishing'       => ['nullable', Rule::in(array_column(Furnishing::cases(), 'value'))],
            'is_serviced'      => ['nullable', 'boolean'],
            'has_bq'           => ['nullable', 'boolean'],
            'has_generator'    => ['nullable', 'boolean'],
            'has_water_supply' => ['nullable', 'boolean'],
            'is_new_build'     => ['nullable', 'boolean'],
            'sort_by'          => ['nullable', Rule::in(['price_asc', 'price_desc', 'newest', 'popular'])],
            'per_page'         => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
