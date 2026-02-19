<?php

namespace App\Enums;

enum WhatsAppSessionState: string
{
    case Idle = 'idle';
    case Searching = 'searching';
    case Browsing = 'browsing';
    case Viewing = 'viewing';
}
