<?php

namespace App\Enums;

enum PropertyStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Rented = 'rented';
    case Sold = 'sold';
    case Archived = 'archived';
}
