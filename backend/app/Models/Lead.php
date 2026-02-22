<?php

namespace App\Models;

use App\Enums\ContactType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class Lead extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'property_id', 'agent_id', 'user_id',
        'contact_type', 'source', 'utm_campaign',
        'responded_at', 'response_time_min',
        'full_name', 'email', 'phone', 'budget_range',
        'timeline', 'financing_type', 'message',
        'status', 'qualification', 'assigned_to', 'staff_notes',
        'qualified_at', 'inspection_at', 'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'contact_type'      => ContactType::class,
            'responded_at'      => 'datetime',
            'response_time_min' => 'integer',
            'created_at'        => 'datetime',
            'qualified_at'      => 'datetime',
            'inspection_at'     => 'datetime',
            'closed_at'         => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function agent(): Relations\BelongsTo
    {
        return $this->belongsTo(AgentProfile::class, 'agent_id');
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function review(): Relations\HasOne
    {
        return $this->hasOne(AgentReview::class);
    }

    public function assignedStaff(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function documents(): Relations\HasMany
    {
        return $this->hasMany(Document::class);
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeByAgent(Builder $query, string $agentId): Builder
    {
        return $query->where('agent_id', $agentId);
    }

    public function scopeByContactType(Builder $query, ContactType $type): Builder
    {
        return $query->where('contact_type', $type);
    }

    public function scopeResponded(Builder $query): Builder
    {
        return $query->whereNotNull('responded_at');
    }

    public function scopeUnresponded(Builder $query): Builder
    {
        return $query->whereNull('responded_at');
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByAssignedTo(Builder $query, string $userId): Builder
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByQualification(Builder $query, string $qualification): Builder
    {
        return $query->where('qualification', $qualification);
    }

    // ── Helpers ──────────────────────────────────────────

    public function markResponded(): void
    {
        $this->update([
            'responded_at'      => now(),
            'response_time_min' => (int) $this->created_at->diffInMinutes(now()),
        ]);
    }
}
