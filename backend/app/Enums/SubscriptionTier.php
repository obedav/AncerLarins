<?php

namespace App\Enums;

enum SubscriptionTier: string
{
    case Free = 'free';
    case Basic = 'basic';
    case Pro = 'pro';
    case Enterprise = 'enterprise';
}
