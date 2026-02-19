<?php

namespace App\Enums;

enum CooperativeMemberStatus: string
{
    case Active = 'active';
    case Paused = 'paused';
    case Withdrawn = 'withdrawn';
}
