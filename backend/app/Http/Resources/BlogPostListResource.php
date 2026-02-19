<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'slug'            => $this->slug,
            'excerpt'         => $this->excerpt,
            'cover_image_url' => $this->cover_image_url,
            'category'        => $this->category?->value,
            'tags'            => $this->tags,
            'view_count'      => $this->view_count,
            'author'          => $this->when(
                $this->relationLoaded('author'),
                fn () => [
                    'id'         => $this->author->id,
                    'full_name'  => $this->author->full_name,
                    'avatar_url' => $this->author->avatar_url,
                ]
            ),
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}
