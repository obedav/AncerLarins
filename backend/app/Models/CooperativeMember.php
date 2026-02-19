<?php

namespace App\Models;

use App\Enums\CooperativeMemberRole;
use App\Enums\CooperativeMemberStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class CooperativeMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'cooperative_id', 'user_id', 'role',
        'total_contributed_kobo', 'joined_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'role'                  => CooperativeMemberRole::class,
            'status'                => CooperativeMemberStatus::class,
            'total_contributed_kobo' => 'integer',
            'joined_at'             => 'datetime',
        ];
    }

    public function cooperative(): Relations\BelongsTo
    {
        return $this->belongsTo(Cooperative::class);
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contributions(): Relations\HasMany
    {
        return $this->hasMany(CooperativeContribution::class, 'member_id');
    }
}
