<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'property_id', 'booking_id', 'amount', 'currency',
        'reference', 'paystack_reference', 'status', 'payment_method', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount'   => 'decimal:2',
            'status'   => PaymentStatus::class,
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
}
