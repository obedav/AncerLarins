<?php

namespace App\Http\Requests\Agent;

use App\Enums\IdDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->agentProfile !== null;
    }

    public function rules(): array
    {
        return [
            'id_document_type'   => ['required', Rule::in(array_column(IdDocumentType::cases(), 'value'))],
            'id_document_number' => ['required', 'string', 'max:100'],
            'id_document_front'  => ['required', 'image', 'max:5120'],
            'id_document_back'   => ['nullable', 'image', 'max:5120'],
            'selfie'             => ['required', 'image', 'max:5120'],
            'cac_document'       => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
