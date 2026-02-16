<?php

namespace App\Models;

use App\Enums\OtpPurpose;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'phone', 'code', 'purpose', 'expires_at', 'verified_at', 'attempts',
    ];

    protected function casts(): array
    {
        return [
            'purpose'     => OtpPurpose::class,
            'expires_at'  => 'datetime',
            'verified_at' => 'datetime',
            'attempts'    => 'integer',
            'created_at'  => 'datetime',
        ];
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeValid(Builder $query): Builder
    {
        return $query->whereNull('verified_at')
            ->where('expires_at', '>', now());
    }

    public function scopeForPhone(Builder $query, string $phone, OtpPurpose $purpose): Builder
    {
        return $query->where('phone', $phone)->where('purpose', $purpose);
    }

    // ── Helpers ──────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function markVerified(): void
    {
        $this->update(['verified_at' => now()]);
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }
}
