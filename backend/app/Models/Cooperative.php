<?php

namespace App\Models;

use App\Enums\ContributionStatus;
use App\Enums\CooperativeStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cooperative extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'admin_user_id',
        'target_amount_kobo', 'property_id', 'estate_id', 'area_id',
        'status', 'member_count', 'monthly_contribution_kobo',
        'start_date', 'target_date',
    ];

    protected function casts(): array
    {
        return [
            'status'                    => CooperativeStatus::class,
            'target_amount_kobo'        => 'integer',
            'monthly_contribution_kobo' => 'integer',
            'member_count'              => 'integer',
            'start_date'                => 'date',
            'target_date'               => 'date',
        ];
    }

    // ── Relationships ─────────────────────────────────────

    public function adminUser(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function members(): Relations\HasMany
    {
        return $this->hasMany(CooperativeMember::class);
    }

    public function contributions(): Relations\HasMany
    {
        return $this->hasMany(CooperativeContribution::class);
    }

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function estate(): Relations\BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    public function area(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    // ── Accessors ─────────────────────────────────────────

    public function getTotalContributedKoboAttribute(): int
    {
        return (int) $this->contributions()
            ->where('status', ContributionStatus::Verified)
            ->sum('amount_kobo');
    }

    public function getProgressPercentageAttribute(): float
    {
        if (! $this->target_amount_kobo) return 0;
        return min(100, round(($this->total_contributed_kobo / $this->target_amount_kobo) * 100, 1));
    }
}
