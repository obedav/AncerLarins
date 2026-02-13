<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class MortgageInquiry extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'property_id',
        'annual_income_kobo', 'employment_type',
        'desired_amount_kobo', 'status', 'partner_bank',
    ];

    protected function casts(): array
    {
        return [
            'annual_income_kobo'  => 'integer',
            'desired_amount_kobo' => 'integer',
            'created_at'          => 'datetime',
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
