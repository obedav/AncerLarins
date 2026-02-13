<?php

namespace App\Enums;

enum ListingType: string
{
    case SALE     = 'sale';
    case RENT     = 'rent';
    case SHORTLET = 'shortlet';
}
