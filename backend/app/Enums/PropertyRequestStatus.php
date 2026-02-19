<?php

namespace App\Enums;

enum PropertyRequestStatus: string
{
    case Active = 'active';
    case Fulfilled = 'fulfilled';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
}
