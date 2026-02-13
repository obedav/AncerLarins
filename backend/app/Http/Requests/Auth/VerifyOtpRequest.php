<?php

namespace App\Http\Requests\Auth;

use App\Enums\OtpPurpose;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone'   => ['required', 'string', 'regex:/^(\+234|0)[789]\d{9}$/'],
            'code'    => ['required', 'string', 'size:6'],
            'purpose' => ['required', Rule::in(array_column(OtpPurpose::cases(), 'value'))],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be a valid Nigerian number.',
            'code.size'   => 'OTP must be exactly 6 digits.',
        ];
    }
}
