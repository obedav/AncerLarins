<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class CreateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agent_profile_id'      => ['required', 'uuid', 'exists:agent_profiles,id'],
            'lead_id'               => ['nullable', 'uuid', 'exists:leads,id'],
            'overall_rating'        => ['required', 'numeric', 'min:1', 'max:5'],
            'communication_rating'  => ['nullable', 'numeric', 'min:1', 'max:5'],
            'responsiveness_rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'negotiation_rating'    => ['nullable', 'numeric', 'min:1', 'max:5'],
            'comment'               => ['nullable', 'string', 'max:2000'],
        ];
    }
}
