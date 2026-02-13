<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agent_profile_id' => ['required', 'uuid', 'exists:agent_profiles,id'],
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
