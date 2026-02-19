<?php

namespace App\Enums;

enum EstateType: string
{
    case GatedEstate = 'gated_estate';
    case OpenEstate = 'open_estate';
    case Highrise = 'highrise';
    case MixedUse = 'mixed_use';
}
