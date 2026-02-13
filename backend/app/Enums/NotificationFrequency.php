<?php

namespace App\Enums;

enum NotificationFrequency: string
{
    case Instant = 'instant';
    case Daily = 'daily';
    case Weekly = 'weekly';
}
