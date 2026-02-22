<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class Commission extends Model
{
    use HasUuids;

    protected $fillable = [
        'lead_id', 'property_id', 'sale_price_kobo',
        'commission_rate', 'commission_amount_kobo',
        'status', 'payment_method', 'payment_reference',
        'paid_at', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sale_price_kobo'        => 'integer',
            'commission_rate'        => 'decimal:2',
            'commission_amount_kobo' => 'integer',
            'paid_at'                => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function lead(): Relations\BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function creator(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Helpers ──────────────────────────────────────────

    public static function calculate(int $salePriceKobo, float $rate = 2.5): int
    {
        return (int) round($salePriceKobo * ($rate / 100));
    }

    public function getFormattedSalePrice(): string
    {
        return '₦' . number_format($this->sale_price_kobo / 100, 0, '.', ',');
    }

    public function getFormattedCommission(): string
    {
        return '₦' . number_format($this->commission_amount_kobo / 100, 0, '.', ',');
    }
}
