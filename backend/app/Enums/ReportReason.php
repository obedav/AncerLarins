<?php

namespace App\Enums;

enum ReportReason: string
{
    case Scam = 'scam';
    case FakeListing = 'fake_listing';
    case WrongPrice = 'wrong_price';
    case WrongPhotos = 'wrong_photos';
    case AlreadyRented = 'already_rented';
    case Harassment = 'harassment';
    case Spam = 'spam';
    case Other = 'other';
}
