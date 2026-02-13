<?php

namespace App\Http\Requests\SavedSearch;

use App\Enums\ListingType;
use App\Enums\NotificationFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateSavedSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'                   => ['required', 'string', 'max:200'],
            'listing_type'           => ['nullable', Rule::in(array_column(ListingType::cases(), 'value'))],
            'property_type_id'       => ['nullable', 'uuid', 'exists:property_types,id'],
            'city_id'                => ['nullable', 'uuid', 'exists:cities,id'],
            'area_ids'               => ['nullable', 'array'],
            'area_ids.*'             => ['uuid', 'exists:areas,id'],
            'min_price'              => ['nullable', 'integer', 'min:0'],
            'max_price'              => ['nullable', 'integer', 'min:0'],
            'min_bedrooms'           => ['nullable', 'integer', 'min:0'],
            'max_bedrooms'           => ['nullable', 'integer', 'min:0'],
            'notification_frequency' => ['sometimes', Rule::in(array_column(NotificationFrequency::cases(), 'value'))],
            'additional_filters'     => ['nullable', 'array'],
        ];
    }
}
