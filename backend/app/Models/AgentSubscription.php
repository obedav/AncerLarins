<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class AgentSubscription extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'agent_profile_id', 'tier', 'amount_kobo',
        'payment_reference', 'payment_provider',
        'starts_at', 'ends_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'amount_kobo' => 'integer',
            'status'      => SubscriptionStatus::class,
            'starts_at'   => 'datetime',
            'ends_at'     => 'datetime',
            'created_at'  => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function agentProfile(): Relations\BelongsTo
    {
        return $this->belongsTo(AgentProfile::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::Active)
            ->where('ends_at', '>', now());
    }
}
