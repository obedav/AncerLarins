<?php

namespace App\Enums;

enum UserRole: string
{
    case User = 'user';
    case Agent = 'agent';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';
}
