<?php

namespace App\Models;

use App\Enums\ContributionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class CooperativeContribution extends Model
{
    use HasUuids;

    protected $fillable = [
        'cooperative_id', 'member_id', 'amount_kobo',
        'payment_reference', 'payment_method', 'status',
        'contributed_at', 'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'status'         => ContributionStatus::class,
            'amount_kobo'    => 'integer',
            'contributed_at' => 'datetime',
            'verified_at'    => 'datetime',
        ];
    }

    public function cooperative(): Relations\BelongsTo
    {
        return $this->belongsTo(Cooperative::class);
    }

    public function member(): Relations\BelongsTo
    {
        return $this->belongsTo(CooperativeMember::class, 'member_id');
    }
}
