<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class DemoteAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid', 'exists:users,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $target = User::find($this->user_id);

            if ($target && $target->id === $this->user()->id) {
                $validator->errors()->add('user_id', 'You cannot demote yourself.');
            }

            if ($target && $target->role === UserRole::SuperAdmin) {
                $validator->errors()->add('user_id', 'Cannot demote a super admin.');
            }
        });
    }
}
