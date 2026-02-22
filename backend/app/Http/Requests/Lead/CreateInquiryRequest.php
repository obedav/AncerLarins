<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;

class CreateInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Guest-friendly — anyone can submit
    }

    public function rules(): array
    {
        $isGuest = $this->user() === null;

        return [
            'property_id'    => ['required', 'uuid', 'exists:properties,id'],
            'full_name'      => [$isGuest ? 'required' : 'nullable', 'string', 'max:100'],
            'email'          => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'phone'          => [$isGuest ? 'required' : 'nullable', 'string', 'max:20'],
            'budget_range'   => ['nullable', 'string', 'max:50'],
            'timeline'       => ['nullable', 'in:immediately,1_3_months,3_6_months,6_12_months,just_browsing'],
            'financing_type' => ['nullable', 'in:cash,mortgage,undecided'],
            'message'        => ['nullable', 'string', 'max:1000'],
            'source'         => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Please enter your full name.',
            'email.required'     => 'Please enter your email address.',
            'phone.required'     => 'Please enter your phone number.',
        ];
    }
}
