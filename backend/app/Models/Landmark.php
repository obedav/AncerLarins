<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class Landmark extends Model
{
    use HasUuids;

    protected $fillable = ['area_id', 'name', 'type', 'latitude', 'longitude'];

    // ── Relationships ────────────────────────────────────

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    // ── Location helpers ─────────────────────────────────

    public function setLocation(float $lat, float $lng): void
    {
        $this->update(['latitude' => $lat, 'longitude' => $lng]);
    }
}
