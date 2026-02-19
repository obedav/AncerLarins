<?php

namespace App\Models;

use App\Enums\WhatsAppSessionState;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class WhatsAppConversation extends Model
{
    use HasUuids;

    protected $fillable = [
        'phone', 'session_state', 'session_data',
        'last_message_at', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'session_state'   => WhatsAppSessionState::class,
            'session_data'    => 'array',
            'last_message_at' => 'datetime',
        ];
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
