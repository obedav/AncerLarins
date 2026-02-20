# AncerLarins

**The most trusted real estate platform in Lagos.**

AncerLarins connects buyers, tenants, and verified agents across Nigeria's most vibrant city. Browse verified listings, explore neighborhoods with real data, and reach agents instantly via WhatsApp — no forms, no waiting, no middlemen.

---

## What Makes AncerLarins Different

- **Verified Agents Only** — Every agent is vetted. No scams, no ghost listings.
- **Instant WhatsApp Contact** — See a property you like? Message the agent in one tap.
- **Neighborhood Intelligence** — Safety scores, transport ratings, amenity maps, and price trends for every area in Lagos.
- **AncerEstimate** — AI-powered property valuations so you know what a fair price looks like.
- **Cooperative Buying** — Pool resources with others to afford properties together. Track contributions, manage members, and reach targets as a group.
- **Reverse Listings** — Post what you're looking for and let agents come to you with matching properties.
- **Estate Directory** — Browse Lagos estates with reviews, amenities, and service charge info from actual residents.

---

## Platform Overview

### For Home Seekers
- Search and filter thousands of Lagos properties (rent, sale, short-let)
- Explore neighborhoods with scores, reviews, and market trends
- Save properties and searches with instant alerts
- Create property requests — describe what you need, agents respond
- Join cooperatives to co-invest in properties

### For Agents
- List and manage properties with image uploads via Cloudinary
- Receive leads and respond to property requests
- Subscription tiers with listing limits
- Verified badge builds trust with potential clients

### For Admins
- Full dashboard with property, agent, and user metrics
- Property and agent moderation (approve/reject workflow)
- Estate, cooperative, and property request management
- Blog CMS for market guides, tips, and area spotlights
- Scraped listing review and import pipeline
- Activity logs and report management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **State Management** | Redux Toolkit (RTK Query) + Zustand |
| **Maps** | Leaflet + React Leaflet |
| **Backend** | Laravel 11, PHP 8.2 |
| **Auth** | Laravel Sanctum (token-based) + OTP via Termii |
| **Database** | PostgreSQL with PostGIS (via Laravel Magellan) |
| **File Storage** | Cloudinary |
| **Payments** | Paystack (cooperative contributions, subscriptions) |
| **Cache** | Redis (via Predis) |

---

## Project Structure

```
ancerlarins/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Enums/              # Status & type enums
│   │   ├── Http/
│   │   │   ├── Controllers/    # API controllers (v1)
│   │   │   ├── Requests/       # Form request validation
│   │   │   └── Resources/      # API resource transformers
│   │   ├── Models/             # Eloquent models (UUID, soft deletes)
│   │   ├── Services/           # Business logic layer
│   │   └── Traits/             # ApiResponse trait
│   ├── database/
│   │   ├── migrations/         # Schema definitions
│   │   └── seeders/            # Test data (Lagos areas, properties, estates, etc.)
│   └── routes/api.php          # All API routes
│
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── (auth)/         # Login & registration
│       │   ├── admin/          # Admin panel (dashboard, moderation, CMS)
│       │   ├── agents/         # Agent directory
│       │   ├── blog/           # Blog posts
│       │   ├── cooperatives/   # Cooperative listings
│       │   ├── dashboard/      # User/agent dashboard
│       │   ├── estates/        # Estate directory
│       │   ├── neighborhoods/  # Area explorer
│       │   ├── properties/     # Property search & detail
│       │   └── requests/       # Property request marketplace
│       ├── components/         # Reusable UI components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities, constants, auth helpers
│       ├── store/api/          # RTK Query API slices
│       └── types/              # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL with PostGIS extension
- Redis

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure your .env (database, Redis, Cloudinary, Paystack, Termii)

php artisan migrate --seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local

# Set NEXT_PUBLIC_API_URL to your backend URL (e.g. http://localhost:8000/api/v1)

npm run dev
```

### Test Accounts

After seeding, these accounts are available (all use OTP code `000000` in local environment):

| Role | Phone | Email |
|------|-------|-------|
| **Admin** | `+2348000000001` | admin@ancerlarins.com |
| **User** | `+2348000000002` | user@test.com |
| **Agent** | `+2348000000003` | agent@test.com |

---

## API Architecture

All endpoints are prefixed with `/api/v1`. Authentication uses Sanctum bearer tokens obtained through the OTP login flow.

**Public** — Property search, agent directory, estates, blog, neighborhoods

**Authenticated** — User profile, saved properties, cooperatives, property requests, notifications

**Agent** — Property CRUD, lead management, request responses, subscription

**Admin** — Dashboard metrics, property/agent moderation, estate/cooperative/request management, blog CMS, activity logs

---

## Key Features Deep Dive

### Cooperative Buying
Users create or join cooperatives targeting specific properties or areas. Members contribute via Paystack, with real-time progress tracking. Admins can manage status transitions: Forming → Active → Target Reached → Completed.

### Property Requests (Reverse Listings)
Buyers post what they're looking for — location, budget, bedrooms, amenities. Verified agents browse requests and respond with matching properties and proposals. Requesters can accept responses to connect directly.

### Estate Directory
Comprehensive Lagos estate database with resident reviews, security info, service charges, utility sources, and amenity lists. Admin-managed with full CRUD.

### Neighborhood Intelligence
Every Lagos area has detailed insights: safety, transport, amenities, and noise scores from resident reviews. Price trends show market movement over time. Interactive maps powered by Leaflet and PostGIS.

---

## License

Proprietary. All rights reserved.
