<?php

namespace App\Http\Requests\Property;

use App\Enums\Furnishing;
use App\Enums\ListingType;
use App\Enums\RentPeriod;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $property = $this->route('property');
        $user = $this->user();

        return $user && (
            $user->agentProfile?->id === $property->agent_id
            || in_array($user->role, [UserRole::Admin, UserRole::SuperAdmin])
        );
    }

    public function rules(): array
    {
        return [
            'listing_type'       => ['sometimes', Rule::in(array_column(ListingType::cases(), 'value'))],
            'property_type_id'   => ['sometimes', 'uuid', 'exists:property_types,id'],
            'title'              => ['sometimes', 'string', 'max:255'],
            'description'        => ['sometimes', 'string', 'max:5000'],
            'price_kobo'         => ['sometimes', 'integer', 'min:0'],
            'price_negotiable'   => ['sometimes', 'boolean'],
            'rent_period'        => ['nullable', Rule::in(array_column(RentPeriod::cases(), 'value'))],
            'agency_fee_pct'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'caution_fee_kobo'   => ['nullable', 'integer', 'min:0'],
            'service_charge_kobo' => ['nullable', 'integer', 'min:0'],
            'legal_fee_kobo'     => ['nullable', 'integer', 'min:0'],
            'state_id'           => ['sometimes', 'uuid', 'exists:states,id'],
            'city_id'            => ['sometimes', 'uuid', 'exists:cities,id'],
            'area_id'            => ['nullable', 'uuid', 'exists:areas,id'],
            'address'            => ['sometimes', 'string', 'max:500'],
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
            'available_from'     => ['nullable', 'date'],
            'inspection_available' => ['sometimes', 'boolean'],
            'amenity_ids'        => ['nullable', 'array'],
            'amenity_ids.*'      => ['uuid', 'exists:amenities,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $stateId = $this->state_id ?? $this->route('property')->state_id;
            $cityId = $this->city_id ?? $this->route('property')->city_id;

            if ($this->city_id) {
                $city = \App\Models\City::find($this->city_id);
                if ($city && $city->state_id !== $stateId) {
                    $validator->errors()->add('city_id', 'City does not belong to the selected state.');
                }
            }

            if ($this->area_id) {
                $area = \App\Models\Area::find($this->area_id);
                if ($area && $area->city_id !== $cityId) {
                    $validator->errors()->add('area_id', 'Area does not belong to the selected city.');
                }
            }
        });
    }
}
