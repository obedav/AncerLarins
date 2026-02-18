<?php

namespace App\Enums;

enum ScrapedListingStatus: string
{
    case Pending = 'pending';
    case Imported = 'imported';
    case Rejected = 'rejected';
    case Duplicate = 'duplicate';
}
