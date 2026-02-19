<?php

namespace App\Http\Requests\PropertyRequest;

use Illuminate\Foundation\Http\FormRequest;

class RespondToRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message'             => ['required', 'string', 'max:2000'],
            'proposed_price_kobo' => ['nullable', 'integer', 'min:0'],
            'property_id'         => ['nullable', 'uuid', 'exists:properties,id'],
        ];
    }
}
