<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class PropertyType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug', 'icon', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active'  => 'boolean',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function properties(): Relations\HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function savedSearches(): Relations\HasMany
    {
        return $this->hasMany(SavedSearch::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
