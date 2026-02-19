<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class EstateReview extends Model
{
    use HasUuids;

    protected $fillable = [
        'estate_id', 'user_id', 'rating', 'pros', 'cons',
        'lived_from', 'lived_to',
    ];

    protected function casts(): array
    {
        return [
            'rating'     => 'integer',
            'lived_from' => 'date',
            'lived_to'   => 'date',
        ];
    }

    public function estate(): Relations\BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    public function user(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
