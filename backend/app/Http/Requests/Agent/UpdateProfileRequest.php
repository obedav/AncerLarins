<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->agentProfile !== null;
    }

    public function rules(): array
    {
        return [
            'company_name'    => ['sometimes', 'string', 'max:200'],
            'license_number'  => ['nullable', 'string', 'max:100'],
            'bio'             => ['nullable', 'string', 'max:2000'],
            'office_address'  => ['nullable', 'string', 'max:500'],
            'office_area_id'  => ['nullable', 'uuid', 'exists:areas,id'],
            'website'         => ['nullable', 'url', 'max:500'],
            'whatsapp_number' => ['nullable', 'string', 'regex:/^(\+234|0)[789]\d{9}$/'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string', 'max:100'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:50'],
            'logo_url'        => ['nullable', 'url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'whatsapp_number.regex' => 'WhatsApp number must be a valid Nigerian number.',
        ];
    }
}
