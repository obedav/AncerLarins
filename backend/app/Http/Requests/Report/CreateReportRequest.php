<?php

namespace App\Http\Requests\Report;

use App\Enums\ReportReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reportable_type' => ['required', Rule::in(['property', 'agent', 'review'])],
            'reportable_id'   => ['required', 'uuid'],
            'reason'          => ['required', Rule::in(array_column(ReportReason::cases(), 'value'))],
            'description'     => ['nullable', 'string', 'max:2000'],
            'evidence_urls'   => ['nullable', 'array', 'max:5'],
            'evidence_urls.*' => ['url'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $typeMap = [
                'property' => \App\Models\Property::class,
                'agent'    => \App\Models\AgentProfile::class,
                'review'   => \App\Models\AgentReview::class,
            ];

            $type = $this->reportable_type;
            if (isset($typeMap[$type])) {
                $model = $typeMap[$type]::find($this->reportable_id);
                if (! $model) {
                    $validator->errors()->add('reportable_id', "The selected {$type} does not exist.");
                }
            }
        });
    }
}
