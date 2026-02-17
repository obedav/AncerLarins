<?php

namespace App\Http\Requests\Neighborhood;

use Illuminate\Foundation\Http\FormRequest;

class CreateNeighborhoodReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'overall'        => 'required|numeric|min:1|max:5',
            'safety'         => 'required|numeric|min:1|max:5',
            'transport'      => 'required|numeric|min:1|max:5',
            'amenities'      => 'required|numeric|min:1|max:5',
            'noise'          => 'required|numeric|min:1|max:5',
            'comment'        => 'nullable|string|max:1000',
            'lived_duration' => 'nullable|string|max:50',
        ];
    }
}
