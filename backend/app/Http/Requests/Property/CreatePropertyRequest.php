<?php

namespace App\Http\Requests\Property;

use App\Enums\Furnishing;
use App\Enums\ListingType;
use App\Enums\RentPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->agentProfile !== null;
    }

    public function rules(): array
    {
        return [
            'listing_type'       => ['required', Rule::in(array_column(ListingType::cases(), 'value'))],
            'property_type_id'   => ['required', 'uuid', 'exists:property_types,id'],
            'title'              => ['required', 'string', 'max:255'],
            'description'        => ['required', 'string', 'max:5000'],
            'price_kobo'         => ['required', 'integer', 'min:1'],
            'price_negotiable'   => ['sometimes', 'boolean'],
            'rent_period'        => ['required_if:listing_type,rent,short_let', 'nullable', Rule::in(array_column(RentPeriod::cases(), 'value'))],
            'agency_fee_pct'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'caution_fee_kobo'   => ['nullable', 'integer', 'min:0'],
            'service_charge_kobo' => ['nullable', 'integer', 'min:0'],
            'legal_fee_kobo'     => ['nullable', 'integer', 'min:0'],
            'min_stay_days'      => ['nullable', 'integer', 'min:1', 'max:365'],
            'max_stay_days'      => ['nullable', 'integer', 'min:1', 'max:365'],
            'check_in_time'      => ['nullable', 'date_format:H:i'],
            'check_out_time'     => ['nullable', 'date_format:H:i'],
            'state_id'           => ['required', 'uuid', 'exists:states,id'],
            'city_id'            => ['required', 'uuid', 'exists:cities,id'],
            'area_id'            => ['nullable', 'uuid', 'exists:areas,id'],
            'address'            => ['required', 'string', 'max:500'],
            'landmark_note'      => ['nullable', 'string', 'max:255'],
            'location_fuzzy'     => ['sometimes', 'boolean'],
            'latitude'           => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'          => ['nullable', 'numeric', 'between:-180,180'],
            'bedrooms'           => ['nullable', 'integer', 'min:0', 'max:50'],
            'bathrooms'          => ['nullable', 'integer', 'min:0', 'max:50'],
            'toilets'            => ['nullable', 'integer', 'min:0', 'max:50'],
            'sitting_rooms'      => ['nullable', 'integer', 'min:0', 'max:20'],
            'floor_area_sqm'     => ['nullable', 'numeric', 'min:0'],
            'land_area_sqm'      => ['nullable', 'numeric', 'min:0'],
            'floor_number'       => ['nullable', 'integer', 'min:0'],
            'total_floors'       => ['nullable', 'integer', 'min:0'],
            'year_built'         => ['nullable', 'integer', 'min:1900', 'max:' . date('Y')],
            'furnishing'         => ['nullable', Rule::in(array_column(Furnishing::cases(), 'value'))],
            'parking_spaces'     => ['nullable', 'integer', 'min:0'],
            'has_bq'             => ['sometimes', 'boolean'],
            'has_swimming_pool'  => ['sometimes', 'boolean'],
            'has_gym'            => ['sometimes', 'boolean'],
            'has_cctv'           => ['sometimes', 'boolean'],
            'has_generator'      => ['sometimes', 'boolean'],
            'has_water_supply'   => ['sometimes', 'boolean'],
            'has_prepaid_meter'  => ['sometimes', 'boolean'],
            'is_serviced'        => ['sometimes', 'boolean'],
            'is_new_build'       => ['sometimes', 'boolean'],
            'available_from'     => ['nullable', 'date', 'after_or_equal:today'],
            'inspection_available' => ['sometimes', 'boolean'],
            'amenity_ids'        => ['nullable', 'array'],
            'amenity_ids.*'      => ['uuid', 'exists:amenities,id'],
            'images'             => ['nullable', 'array', 'max:20'],
            'images.*'           => ['image', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->city_id) {
                $city = \App\Models\City::find($this->city_id);
                if ($city && $this->state_id && $city->state_id !== $this->state_id) {
                    $validator->errors()->add('city_id', 'City does not belong to the selected state.');
                }
            }

            if ($this->area_id) {
                $area = \App\Models\Area::find($this->area_id);
                if ($area && $this->city_id && $area->city_id !== $this->city_id) {
                    $validator->errors()->add('area_id', 'Area does not belong to the selected city.');
                }
            }
        });
    }
}
