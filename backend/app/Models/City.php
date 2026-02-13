<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class City extends Model
{
    use HasUuids;

    protected $fillable = ['state_id', 'name', 'slug', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    // ── Relationships ────────────────────────────────────

    public function state(): Relations\BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function areas(): Relations\HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function properties(): Relations\HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function savedSearches(): Relations\HasMany
    {
        return $this->hasMany(SavedSearch::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
