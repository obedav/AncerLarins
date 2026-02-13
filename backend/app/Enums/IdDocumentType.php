<?php

namespace App\Enums;

enum IdDocumentType: string
{
    case NIN = 'NIN';
    case DriversLicense = 'drivers_license';
    case VotersCard = 'voters_card';
}
