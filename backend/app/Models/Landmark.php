<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;
use Illuminate\Support\Facades\DB;

class Landmark extends Model
{
    use HasUuids;

    protected $fillable = ['area_id', 'name', 'type'];

    // ── Relationships ────────────────────────────────────

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    // ── Location helpers ─────────────────────────────────

    public function setLocation(float $lat, float $lng): void
    {
        DB::statement(
            'UPDATE landmarks SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
            [$lng, $lat, $this->id]
        );
    }
}
