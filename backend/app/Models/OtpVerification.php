<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $fillable = ['phone', 'otp_code', 'pin_id', 'verified', 'expires_at'];

    protected function casts(): array
    {
        return [
            'verified'   => 'boolean',
            'expires_at' => 'datetime',
        ];
    }
}
