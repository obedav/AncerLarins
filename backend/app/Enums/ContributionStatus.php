<?php

namespace App\Enums;

enum ContributionStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Failed = 'failed';
}
