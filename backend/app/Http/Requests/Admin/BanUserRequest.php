<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BanUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'user_id'    => ['required', 'uuid', 'exists:users,id'],
            'ban_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
