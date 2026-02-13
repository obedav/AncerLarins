# AncerLarins - Architecture Documentation

## Overview
AncerLarins is a Lagos-first real estate platform designed for the Nigerian market. It supports property listing, search, booking, payments, and geolocation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Laravel 11 (PHP 8.2+) |
| Frontend Web | Next.js 15, TypeScript, Tailwind CSS, Redux Toolkit |
| Mobile | React Native + Expo (Android, separate repo) |
| Database | PostgreSQL 16 + PostGIS |
| Cache/Queue | Redis |
| Image Storage | Cloudinary |
| Maps | Leaflet (web), Google Maps (mobile) |
| SMS/OTP | Termii API |
| Payments | Paystack API |
| Push Notifications | Firebase Cloud Messaging |
| Auth | Laravel Sanctum (token-based) |

## Project Structure

```
ancerlarins/
├── backend/                 # Laravel 11 API
│   ├── app/
│   │   ├── Enums/           # PHP enums (PropertyType, ListingType, etc.)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/  # Versioned API controllers
│   │   │   ├── Middleware/  # ForceJsonResponse
│   │   │   └── Resources/  # API Resources (JSON transformers)
│   │   ├── Models/          # Eloquent models
│   │   ├── Services/        # External API integrations
│   │   └── Traits/          # ApiResponse trait
│   ├── database/migrations/ # Database schema
│   ├── routes/api.php       # API routes (v1 prefix)
│   └── config/              # App configuration
├── frontend/                # Next.js 15 web app
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # React components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # API client, utilities
│       ├── store/           # Redux Toolkit store & slices
│       └── types/           # TypeScript interfaces
├── docs/                    # This documentation
└── docker-compose.yml       # PostgreSQL + Redis + pgAdmin
```

## API Routes (v1)

### Public Endpoints
- `POST   /api/v1/auth/register` - User registration
- `POST   /api/v1/auth/login` - User login
- `POST   /api/v1/auth/otp/send` - Send OTP
- `POST   /api/v1/auth/otp/verify` - Verify OTP
- `GET    /api/v1/properties` - List properties (filterable)
- `GET    /api/v1/properties/featured` - Featured properties
- `GET    /api/v1/properties/{slug}` - Property detail
- `GET    /api/v1/search` - Full-text search
- `GET    /api/v1/search/nearby` - Geo-based nearby search
- `GET    /api/v1/search/autocomplete` - Autocomplete
- `GET    /api/v1/neighborhoods` - List neighborhoods
- `GET    /api/v1/neighborhoods/{slug}` - Neighborhood detail
- `GET    /api/v1/properties/{property}/reviews` - Property reviews
- `POST   /api/v1/payments/webhook` - Paystack webhook

### Authenticated Endpoints (Bearer token)
- `POST   /api/v1/auth/logout` - Logout
- `GET    /api/v1/auth/me` - Current user
- `POST   /api/v1/properties` - Create property
- `PUT    /api/v1/properties/{id}` - Update property
- `DELETE /api/v1/properties/{id}` - Delete property
- `POST   /api/v1/properties/{id}/images` - Upload images
- `GET    /api/v1/my/properties` - My listings
- `GET    /api/v1/bookings` - My bookings
- `POST   /api/v1/bookings` - Create booking
- `PUT    /api/v1/bookings/{id}` - Update booking
- `POST   /api/v1/payments/initialize` - Init Paystack payment
- `GET    /api/v1/payments/verify/{ref}` - Verify payment
- `GET    /api/v1/payments/history` - Payment history
- `POST   /api/v1/properties/{id}/reviews` - Add review
- `GET    /api/v1/favorites` - My favorites
- `POST   /api/v1/favorites/{id}` - Toggle favorite
- `PUT    /api/v1/profile` - Update profile
- `POST   /api/v1/profile/avatar` - Upload avatar

## Database Schema

### Core Tables
- **users** - Accounts with roles (tenant, landlord, agent, admin)
- **properties** - Listings with geolocation, amenities, pricing
- **property_images** - Cloudinary-hosted images per property
- **neighborhoods** - Lagos area profiles with avg pricing & safety ratings
- **bookings** - Property viewing appointments
- **payments** - Paystack transaction records (NGN)
- **reviews** - 1-5 star ratings per property (one per user)
- **favorites** - User-property bookmarks
- **saved_searches** - Saved filter sets with notification toggle
- **otp_verifications** - Termii OTP tracking

## External Service Integrations

### Termii (SMS/OTP)
- Send 6-digit OTP for phone verification
- Verify OTP codes
- Send transactional SMS

### Paystack (Payments)
- Initialize transactions in NGN (kobo)
- Verify transaction status
- Webhook for async payment confirmation
- Bank account resolution

### Cloudinary (Images)
- Property image upload with auto-optimization
- Avatar upload
- Organized in folders: `ancerlarins/properties/`, `ancerlarins/avatars/`

### Firebase Cloud Messaging
- Push notifications to Android devices
- Single and batch device targeting

## Running Locally

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Backend
cd backend
cp .env.example .env   # Already configured
composer install
php artisan migrate
php artisan serve       # http://localhost:8000

# 3. Frontend
cd frontend
npm install
npm run dev             # http://localhost:3000
```
