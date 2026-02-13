<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class AgentReview extends Model
{
    use HasUuids;

    protected $fillable = [
        'agent_id', 'user_id',
        'overall_rating', 'responsiveness', 'honesty', 'professionalism',
        'title', 'comment', 'status', 'verified_interaction', 'lead_id',
    ];

    protected function casts(): array
    {
        return [
            'overall_rating'      => 'decimal:1',
            'responsiveness'      => 'decimal:1',
            'honesty'             => 'decimal:1',
            'professionalism'     => 'decimal:1',
            'status'              => ReviewStatus::class,
            'verified_interaction'=> 'boolean',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function agent(): Relations\BelongsTo
    {
        return $this->belongsTo(AgentProfile::class, 'agent_id');
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lead(): Relations\BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', ReviewStatus::Approved);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ReviewStatus::Pending);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('verified_interaction', true);
    }
}
