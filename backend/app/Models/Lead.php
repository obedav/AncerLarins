<?php

namespace App\Models;

use App\Enums\ContactType;
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
    ];

    protected function casts(): array
    {
        return [
            'contact_type'      => ContactType::class,
            'responded_at'      => 'datetime',
            'response_time_min' => 'integer',
            'created_at'        => 'datetime',
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

    // ── Helpers ──────────────────────────────────────────

    public function markResponded(): void
    {
        $this->update([
            'responded_at'      => now(),
            'response_time_min' => (int) $this->created_at->diffInMinutes(now()),
        ]);
    }
}
