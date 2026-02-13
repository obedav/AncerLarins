<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class PriceHistory extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'price_history';

    protected $fillable = ['property_id', 'price_kobo', 'listing_type', 'recorded_at'];

    protected function casts(): array
    {
        return [
            'price_kobo'  => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    // ── Accessors ────────────────────────────────────────

    public function getFormattedPriceAttribute(): string
    {
        return '₦' . number_format($this->price_kobo / 100, 0, '.', ',');
    }
}
