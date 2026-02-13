<?php

namespace App\Enums;

enum ContactType: string
{
    case Whatsapp = 'whatsapp';
    case Call = 'call';
    case Form = 'form';
}
