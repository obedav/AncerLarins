# AncerLarins

**The most trusted real estate platform in Lagos.**

AncerLarins connects buyers, tenants, and verified agents across Nigeria's most vibrant city. Browse verified listings, explore neighborhoods with real data, and reach agents instantly via WhatsApp — no forms, no waiting, no middlemen.

[![Backend CI](https://github.com/your-org/ancerlarins/actions/workflows/backend.yml/badge.svg)](https://github.com/your-org/ancerlarins/actions)

---

## What Makes AncerLarins Different

- **Verified Agents Only** — Every agent is vetted. No scams, no ghost listings.
- **Instant WhatsApp Contact** — See a property you like? Message the agent in one tap.
- **Neighborhood Intelligence** — Safety scores, transport ratings, amenity maps, and price trends for every area in Lagos.
- **AncerEstimate** — AI-powered property valuations so you know what a fair price looks like.
- **Cooperative Buying** — Pool resources with others to afford properties together.
- **Reverse Listings** — Post what you're looking for and let agents come to you.
- **Estate Directory** — Browse Lagos estates with reviews, amenities, and service charge info.
- **Passkey Authentication** — Passwordless sign-in with biometrics (WebAuthn/FIDO2).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **State Management** | Redux Toolkit (RTK Query) |
| **Maps** | Leaflet + React Leaflet + PostGIS |
| **Backend** | Laravel 11, PHP 8.2 |
| **Auth** | Laravel Sanctum + OTP (Termii) + WebAuthn Passkeys |
| **Database** | PostgreSQL 16 with PostGIS 3.4 |
| **File Storage** | Cloudinary (images, video tours) |
| **Payments** | Paystack (subscriptions, cooperative contributions) |
| **Cache & Queues** | Redis 7 |
| **Monitoring** | Prometheus + Grafana + Loki + Sentry |
| **Deployment** | Docker Compose + Nginx + Let's Encrypt |

---

## Platform Overview

### For Home Seekers
- Search and filter thousands of Lagos properties (rent, sale, short-let)
- Explore neighborhoods with safety scores, reviews, and market trends
- Save properties and searches with instant alerts
- Create property requests — describe what you need, agents respond
- Join cooperatives to co-invest in properties

### For Agents
- List and manage properties with Cloudinary image/video uploads
- Receive leads and respond to property requests
- Subscription tiers with listing limits
- Verified badge builds trust with potential clients
- Performance dashboard with lead analytics

### For Admins
- Full dashboard with property, agent, and user metrics
- Property and agent moderation (approve/reject workflow)
- Estate, cooperative, and property request management
- Blog CMS for market guides, tips, and area spotlights
- Scraped listing review and import pipeline
- Commission and revenue tracking
- Activity logs, report management, and team administration

---

## Project Structure

```
ancerlarins/
├── backend/                       # Laravel 11 API
│   ├── app/
│   │   ├── Console/Commands/      # Artisan commands (backups, cleanup)
│   │   ├── Enums/                 # 28 status & type enums
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/  # REST API controllers
│   │   │   ├── Middleware/          # Auth guards, security headers
│   │   │   ├── Requests/           # Form request validation
│   │   │   └── Resources/          # API resource transformers
│   │   ├── Models/                # 41 Eloquent models (UUID, soft deletes)
│   │   ├── Services/              # 27 service classes (business logic)
│   │   └── Traits/                # ApiResponse, AttachesAuthCookies
│   ├── database/
│   │   ├── factories/             # Model factories for testing
│   │   ├── migrations/            # 60+ schema migrations
│   │   └── seeders/               # Lagos test data
│   ├── routes/api.php             # All API routes (~120 endpoints)
│   └── tests/Feature/             # PHPUnit feature tests
│
├── frontend/                      # Next.js 16 application
│   └── src/
│       ├── app/                   # App Router pages
│       │   ├── (auth)/            # Login & registration
│       │   ├── admin/             # Admin panel (13 pages)
│       │   ├── dashboard/         # User/agent dashboard (10 pages)
│       │   ├── properties/        # Property search & detail
│       │   └── ...                # Blog, estates, cooperatives, etc.
│       ├── components/            # Reusable UI components
│       ├── hooks/                 # Custom React hooks
│       ├── lib/                   # Utilities, schemas, auth
│       ├── store/api/             # RTK Query API slices
│       └── types/                 # TypeScript interfaces
│
├── deployment/docker/             # Production Docker Compose
│   ├── docker-compose.yml         # 18 services (app, db, cache, monitoring)
│   ├── Dockerfile.backend         # PHP-FPM image
│   ├── Dockerfile.frontend        # Next.js standalone image
│   ├── nginx.conf                 # Reverse proxy config
│   └── ...                        # Prometheus, Grafana, Loki configs
│
├── docs/                          # Documentation
│   ├── architecture.md            # System design & data flow
│   ├── database.md                # ERD & data model reference
│   └── deployment.md              # Production deployment guide
│
└── docker-compose.yml             # Development environment (Postgres + Redis)
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended) **OR**
- PHP 8.2+, Composer, Node.js 18+, PostgreSQL 16 with PostGIS, Redis 7

### Quick Start (Docker)

```bash
# Start development databases
docker compose up -d

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

### Test Accounts

After seeding, use OTP code `000000` in local environment:

| Role | Phone | Email |
|------|-------|-------|
| **Super Admin** | `+2348000000001` | admin@ancerlarins.com |
| **User** | `+2348000000002` | user@test.com |
| **Agent** | `+2348000000003` | agent@test.com |

---

## API Overview

All endpoints are prefixed with `/api/v1`. Authentication uses Sanctum bearer tokens obtained through the OTP login flow.

| Scope | Endpoints | Description |
|-------|-----------|-------------|
| **Public** | 30+ | Property search, agents, estates, blog, neighborhoods, locations |
| **Authenticated** | 20+ | Profile, saved properties, cooperatives, requests, notifications |
| **Agent** | 20+ | Property CRUD, leads, verification, subscriptions |
| **Admin** | 40+ | Dashboard, moderation, CMS, commissions, activity logs |
| **Super Admin** | 5+ | Team management, system settings, health checks |

Full API documentation is auto-generated with Scribe: `php artisan scribe:generate` → available at `/docs`.

---

## Key Features

### Cooperative Buying
Users create or join cooperatives targeting specific properties or areas. Members contribute via Paystack with real-time progress tracking. Status flow: Forming → Active → Target Reached → Completed.

### Property Requests (Reverse Listings)
Buyers post what they're looking for — location, budget, bedrooms, amenities. Verified agents respond with matching properties. Requesters accept responses to connect directly.

### Estate Directory
Comprehensive Lagos estate database with resident reviews, security info, service charges, utility sources, and amenity lists.

### Neighborhood Intelligence
Every Lagos area has detailed insights: safety, transport, amenities, and noise scores. Price trends show market movement over time. Interactive maps powered by Leaflet and PostGIS.

### Fraud Detection
Automated fraud scoring on listings with admin review queue for flagged properties.

### Passkey Authentication (WebAuthn)
Users can register FIDO2 passkeys (fingerprint, Face ID) for passwordless sign-in alongside the OTP flow.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, service interactions, data flow |
| [Database](docs/database.md) | Entity relationship diagram, data model reference |
| [Deployment](docs/deployment.md) | Production deployment guide (Docker, SSL, DNS) |
| [Changelog](CHANGELOG.md) | Version history and notable changes |
| [API Reference](backend/public/docs) | Auto-generated API docs (run `php artisan scribe:generate`) |

---

## Testing

```bash
# Backend
cd backend
php artisan test

# Frontend
cd frontend
npm run test          # Unit tests (Vitest)
npx playwright test   # E2E tests
```

---

## License

Proprietary. All rights reserved.
