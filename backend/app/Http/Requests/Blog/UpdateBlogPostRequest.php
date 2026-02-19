<?php

namespace App\Http\Requests\Blog;

use App\Enums\BlogPostCategory;
use App\Enums\BlogPostStatus;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, [UserRole::Admin, UserRole::SuperAdmin]);
    }

    public function rules(): array
    {
        return [
            'title'            => ['sometimes', 'string', 'max:255'],
            'content'          => ['sometimes', 'string'],
            'excerpt'          => ['nullable', 'string', 'max:500'],
            'cover_image_url'  => ['nullable', 'url', 'max:2048'],
            'category'         => ['sometimes', Rule::in(array_column(BlogPostCategory::cases(), 'value'))],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:50'],
            'status'           => ['sometimes', Rule::in(array_column(BlogPostStatus::cases(), 'value'))],
            'meta_title'       => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
        ];
    }
}
