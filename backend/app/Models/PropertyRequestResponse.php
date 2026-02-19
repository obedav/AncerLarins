<?php

namespace App\Models;

use App\Enums\RequestResponseStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class PropertyRequestResponse extends Model
{
    use HasUuids;

    protected $fillable = [
        'property_request_id', 'agent_id', 'property_id',
        'message', 'proposed_price_kobo', 'status',
    ];

    protected function casts(): array
    {
        return [
            'status'              => RequestResponseStatus::class,
            'proposed_price_kobo' => 'integer',
        ];
    }

    public function propertyRequest(): Relations\BelongsTo
    {
        return $this->belongsTo(PropertyRequest::class);
    }

    public function agent(): Relations\BelongsTo
    {
        return $this->belongsTo(AgentProfile::class, 'agent_id');
    }

    public function property(): Relations\BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
