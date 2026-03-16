<?php

namespace App\Http\Requests\Passkey;

use Illuminate\Foundation\Http\FormRequest;

class AuthenticatePasskeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'challenge_id' => ['required', 'uuid'],
            'credential' => ['required', 'array'],
            'credential.id' => ['required', 'string'],
            'credential.rawId' => ['required', 'string'],
            'credential.type' => ['required', 'string', 'in:public-key'],
            'credential.response' => ['required', 'array'],
            'credential.response.authenticatorData' => ['required', 'string'],
            'credential.response.clientDataJSON' => ['required', 'string'],
            'credential.response.signature' => ['required', 'string'],
        ];
    }
}
