<?php

namespace App\Enums;

enum ListingType: string
{
    case Rent = 'rent';
    case Sale = 'sale';
    case ShortLet = 'short_let';
}
