<?php

namespace App\Enums;

enum RentPeriod: string
{
    case Yearly = 'yearly';
    case Monthly = 'monthly';
    case Quarterly = 'quarterly';
    case Weekly = 'weekly';
    case Daily = 'daily';
}
