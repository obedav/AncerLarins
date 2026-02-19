<?php

namespace App\Enums;

enum CooperativeMemberRole: string
{
    case Admin = 'admin';
    case Treasurer = 'treasurer';
    case Member = 'member';
}
