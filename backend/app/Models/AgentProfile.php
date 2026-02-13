<?php

namespace App\Models;

use App\Enums\IdDocumentType;
use App\Enums\SubscriptionTier;
use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class AgentProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'business_name', 'license_number',
        'verification_status', 'verified_at', 'verified_by', 'rejection_reason',
        'id_document_type', 'id_document_url', 'cac_document_url',
        'whatsapp_number', 'office_address', 'office_area_id',
        'subscription_tier', 'subscription_expires_at', 'max_listings',
        'active_listings', 'total_listings', 'total_leads',
        'avg_rating', 'total_reviews', 'response_rate', 'avg_response_time',
        'bio', 'specializations', 'years_experience',
    ];

    protected function casts(): array
    {
        return [
            'verification_status'     => VerificationStatus::class,
            'id_document_type'        => IdDocumentType::class,
            'subscription_tier'       => SubscriptionTier::class,
            'verified_at'             => 'datetime',
            'subscription_expires_at' => 'datetime',
            'max_listings'            => 'integer',
            'active_listings'         => 'integer',
            'total_listings'          => 'integer',
            'total_leads'             => 'integer',
            'avg_rating'              => 'decimal:2',
            'total_reviews'           => 'integer',
            'response_rate'           => 'decimal:2',
            'avg_response_time'       => 'integer',
            'specializations'         => 'array',
            'years_experience'        => 'integer',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedByUser(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function officeArea(): Relations\BelongsTo
    {
        return $this->belongsTo(Area::class, 'office_area_id');
    }

    public function properties(): Relations\HasMany
    {
        return $this->hasMany(Property::class, 'agent_id');
    }

    public function subscriptions(): Relations\HasMany
    {
        return $this->hasMany(AgentSubscription::class);
    }

    public function leads(): Relations\HasMany
    {
        return $this->hasMany(Lead::class, 'agent_id');
    }

    public function reviews(): Relations\HasMany
    {
        return $this->hasMany(AgentReview::class, 'agent_id');
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('verification_status', VerificationStatus::Verified);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('verification_status', VerificationStatus::Pending);
    }

    public function scopeSubscribed(Builder $query): Builder
    {
        return $query->where('subscription_tier', '!=', SubscriptionTier::Free)
            ->where('subscription_expires_at', '>', now());
    }

    // ── Helpers ──────────────────────────────────────────

    public function isVerified(): bool
    {
        return $this->verification_status === VerificationStatus::Verified;
    }

    public function canListMore(): bool
    {
        return $this->active_listings < $this->max_listings;
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_tier !== SubscriptionTier::Free
            && $this->subscription_expires_at?->isFuture();
    }
}
