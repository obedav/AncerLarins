<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use App\Rules\Turnstile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^(\+234|0)[789]\d{9}$/', 'unique:users,phone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(10)->mixedCase()->numbers()->symbols()],
            'role' => ['sometimes', Rule::in([UserRole::User->value, UserRole::Agent->value])],
        ];

        if (config('services.turnstile.secret_key')) {
            $rules['turnstile_token'] = ['required', new Turnstile];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be a valid Nigerian number (e.g. +2347012345678 or 07012345678).',
            'turnstile_token.required' => 'Please complete the security check.',
        ];
    }
}
