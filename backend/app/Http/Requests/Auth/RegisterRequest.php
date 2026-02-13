<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'phone'      => ['required', 'string', 'regex:/^(\+234|0)[789]\d{9}$/', 'unique:users,phone'],
            'email'      => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'role'       => ['sometimes', Rule::in([UserRole::User->value, UserRole::Agent->value])],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be a valid Nigerian number (e.g. +2347012345678 or 07012345678).',
        ];
    }
}
