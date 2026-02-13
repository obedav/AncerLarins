<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class SavedProperty extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['user_id', 'property_id'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
