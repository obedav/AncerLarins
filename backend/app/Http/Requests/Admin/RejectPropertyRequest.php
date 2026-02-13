<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'property_id'      => ['required', 'uuid', 'exists:properties,id'],
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
