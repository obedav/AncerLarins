<?php

namespace App\Enums;

enum UserRole: string
{
    case TENANT   = 'tenant';
    case LANDLORD = 'landlord';
    case AGENT    = 'agent';
    case ADMIN    = 'admin';
}
