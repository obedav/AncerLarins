<?php

namespace App\Http\Requests\Cooperative;

use Illuminate\Foundation\Http\FormRequest;

class CreateCooperativeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                      => ['required', 'string', 'max:255'],
            'description'               => ['nullable', 'string', 'max:2000'],
            'target_amount_kobo'        => ['required', 'integer', 'min:100000'], // min ₦1,000
            'monthly_contribution_kobo' => ['nullable', 'integer', 'min:100'],
            'property_id'               => ['nullable', 'uuid', 'exists:properties,id'],
            'estate_id'                 => ['nullable', 'uuid', 'exists:estates,id'],
            'area_id'                   => ['nullable', 'uuid', 'exists:areas,id'],
            'start_date'                => ['nullable', 'date', 'after_or_equal:today'],
            'target_date'               => ['nullable', 'date', 'after:start_date'],
        ];
    }
}
