<?php

namespace App\Enums;

enum CooperativeStatus: string
{
    case Forming = 'forming';
    case Active = 'active';
    case TargetReached = 'target_reached';
    case Completed = 'completed';
    case Dissolved = 'dissolved';
}
