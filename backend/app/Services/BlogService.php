<?php

namespace App\Services;

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Support\Str;

class BlogService
{
    public function getBySlug(string $slug): ?BlogPost
    {
        $post = BlogPost::where('slug', $slug)
            ->published()
            ->with('author')
            ->first();

        if ($post) {
            $post->increment('view_count');
        }

        return $post;
    }

    public function create(array $data, User $author): BlogPost
    {
        $slug = $this->generateSlug($data['title']);

        $post = BlogPost::create(array_merge($data, [
            'author_id' => $author->id,
            'slug'      => $slug,
        ]));

        if (($data['status'] ?? null) === BlogPostStatus::Published->value && ! $post->published_at) {
            $post->update(['published_at' => now()]);
        }

        return $post->load('author');
    }

    public function update(BlogPost $post, array $data): BlogPost
    {
        if (isset($data['title']) && $data['title'] !== $post->title) {
            $data['slug'] = $this->generateSlug($data['title']);
        }

        if (
            isset($data['status']) &&
            $data['status'] === BlogPostStatus::Published->value &&
            ! $post->published_at
        ) {
            $data['published_at'] = now();
        }

        $post->update($data);

        return $post->load('author');
    }

    public function delete(BlogPost $post): void
    {
        $post->delete();
    }

    protected function generateSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = BlogPost::withTrashed()->where('slug', 'like', "{$slug}%")->count();

        return $count > 0 ? "{$slug}-{$count}" : $slug;
    }
}
