<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class State extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'slug', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    // ── Relationships ────────────────────────────────────

    public function cities(): Relations\HasMany
    {
        return $this->hasMany(City::class);
    }

    public function properties(): Relations\HasMany
    {
        return $this->hasMany(Property::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
