<?php

namespace App\Enums;

enum PropertyType: string
{
    case APARTMENT  = 'apartment';
    case HOUSE      = 'house';
    case DUPLEX     = 'duplex';
    case BUNGALOW   = 'bungalow';
    case TERRACE    = 'terrace';
    case PENTHOUSE  = 'penthouse';
    case STUDIO     = 'studio';
    case COMMERCIAL = 'commercial';
    case LAND       = 'land';
    case SHORTLET   = 'shortlet';
}
