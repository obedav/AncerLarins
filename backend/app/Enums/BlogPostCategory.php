<?php

namespace App\Enums;

enum BlogPostCategory: string
{
    case Guide = 'guide';
    case MarketReport = 'market_report';
    case Tips = 'tips';
    case News = 'news';
    case AreaSpotlight = 'area_spotlight';
}
