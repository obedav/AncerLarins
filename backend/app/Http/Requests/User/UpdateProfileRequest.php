<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'first_name'        => ['sometimes', 'string', 'max:100'],
            'last_name'         => ['sometimes', 'string', 'max:100'],
            'email'             => ['nullable', 'email', 'unique:users,email,' . $this->user()->id],
            'avatar_url'        => ['nullable', 'url'],
            'preferred_city_id' => ['nullable', 'uuid', 'exists:cities,id'],
        ];
    }
}
