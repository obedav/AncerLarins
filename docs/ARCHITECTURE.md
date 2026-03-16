# Architecture

## Overview

AncerLarins is a Lagos-first real estate platform built as a monorepo with a decoupled frontend/backend architecture. The backend exposes a versioned REST API consumed by a Next.js frontend via RTK Query. All services run in Docker containers orchestrated by Docker Compose.

```
┌────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                    │
│  Browser (Next.js)  ·  Mobile (React Native)  ·  WhatsApp Bot      │
└──────────────┬─────────────────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼─────────────────────────────────────────────────────┐
│                     NGINX REVERSE PROXY                             │
│  SSL termination · rate limiting · static files · /api → backend    │
│  /health → backend · /* → frontend                                  │
└────┬──────────────────────────────┬────────────────────────────────┘
     │                              │
┌────▼──────────┐          ┌───────▼──────────┐
│  LARAVEL API   │          │  NEXT.JS APP     │
│  PHP-FPM 8.2   │          │  Standalone      │
│  Port 9000     │          │  Port 3000       │
│  Sanctum Auth  │          │  App Router      │
│  120+ endpoints│          │  RTK Query       │
└──┬──────┬──┬──┘          └──────────────────┘
   │      │  │
   │      │  └──────────────────┐
┌──▼──┐ ┌─▼────────┐  ┌───────▼───────┐
│Redis│ │PgBouncer  │  │External APIs  │
│     │ │Port 6432  │  │               │
│Cache│ │Pool: txn  │  │Termii (SMS)   │
│Queue│ │Max: 200   │  │Paystack (Pay) │
│Sess │ └──┬────────┘  │Cloudinary     │
└─────┘    │           │Sentry         │
      ┌────▼────┐      │FCM            │
      │PostgreSQL│      └───────────────┘
      │16+PostGIS│
      │41 tables │
      └─────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS | 16, 19, 5, 4 |
| **State** | Redux Toolkit (RTK Query) | 2.x |
| **Maps** | Leaflet + React Leaflet + PostGIS | 1.9 |
| **Backend** | Laravel (PHP) | 11 (PHP 8.2) |
| **Auth** | Sanctum + OTP (Termii) + WebAuthn Passkeys | — |
| **Database** | PostgreSQL with PostGIS | 16 + 3.4 |
| **File Storage** | Cloudinary (images, video tours) | — |
| **Payments** | Paystack (subscriptions, cooperative contributions) | — |
| **Cache & Queues** | Redis | 7 |
| **Monitoring** | Prometheus + Grafana + Loki + Sentry | — |
| **Deployment** | Docker Compose + Nginx + Let's Encrypt | — |

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
  → Nginx (SSL, rate limit, routing)
    → Laravel (Sanctum middleware, rate throttle)
      → FormRequest (validation, phone normalization)
        → Controller (thin, delegates to Service)
          → Service (business logic, model queries)
            → Model (Eloquent, UUID PKs, soft deletes)
              → PostgreSQL via PgBouncer
```

### Directory Structure

```
backend/app/
├── Console/Commands/     # BackupDatabase, CleanupExpiredTokens
├── Enums/                # 28 PHP enums (UserRole, PropertyStatus, etc.)
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── AdminController      # Dashboard, moderation, user management
│   │   ├── AgentController      # Agent dashboard, leads, profile
│   │   ├── AuthController       # Register, login, OTP, refresh
│   │   ├── PasskeyController    # WebAuthn registration & authentication
│   │   ├── PropertyController   # CRUD, images, video, contact
│   │   ├── SearchController     # Full-text, suggestions, map search
│   │   ├── CooperativeController# Create, join, contribute
│   │   ├── EstateController     # Estate directory, reviews
│   │   └── ...                  # 20 controllers total
│   ├── Middleware/
│   │   ├── EnsureAdmin          # Role gate: admin + super_admin
│   │   ├── EnsureSuperAdmin     # Role gate: super_admin only
│   │   ├── EnsureAgent          # Role gate: agent only
│   │   ├── EnsurePhoneVerified  # Blocks unverified accounts
│   │   ├── SecurityHeaders      # HSTS, X-Frame-Options, etc.
│   │   └── TrackActivity        # Audit log recording
│   ├── Requests/                # 20+ FormRequest classes with validation
│   └── Resources/               # API response transformers
├── Models/                      # 41 Eloquent models (UUID, soft deletes)
├── Services/                    # 27 service classes
│   ├── AuthService              # OTP flow, token issuance, refresh
│   ├── PropertyService          # Listing CRUD, fraud scoring
│   ├── AdminService             # Moderation, dashboard stats
│   ├── CloudinaryService        # Image/video upload
│   ├── ImageService             # Thumbnail generation, optimization
│   ├── TermiiService            # SMS/OTP via Termii API
│   ├── WebauthnService          # Passkey registration & verification
│   └── ...
└── Traits/
    ├── ApiResponse              # Standardized JSON responses
    └── AttachesAuthCookies      # HttpOnly cookie management
```

### Service Layer Pattern

Controllers are thin — they validate input via FormRequest classes and delegate to Service classes for business logic:

```php
// Controller (thin)
public function store(StorePropertyRequest $request) {
    $property = $this->propertyService->create($request->validated());
    return $this->success(new PropertyResource($property), 'Property created', 201);
}

// Service (business logic)
public function create(array $data): Property {
    $data['agent_id'] = auth()->id();
    $data['status'] = PropertyStatus::Pending;
    $data['fraud_score'] = $this->calculateFraudScore($data);
    return Property::create($data);
}
```

---

## Frontend Architecture

### App Router Structure

```
frontend/src/
├── app/
│   ├── (auth)/              # Login, Register (OTP flow)
│   ├── admin/               # 13 admin pages
│   │   ├── page.tsx         # Dashboard overview
│   │   ├── properties/      # Property moderation
│   │   ├── agents/          # Agent verification
│   │   ├── users/           # User management
│   │   ├── inquiries/       # Inquiry pipeline
│   │   ├── revenue/         # Commission tracking
│   │   ├── blog/            # CMS
│   │   ├── estates/         # Estate management
│   │   ├── cooperatives/    # Cooperative oversight
│   │   ├── requests/        # Property request management
│   │   ├── reports/         # Content reports
│   │   ├── activity/        # Audit logs
│   │   ├── scraped/         # Listing imports
│   │   ├── settings/        # System config (super admin)
│   │   └── team/            # Admin team management
│   ├── dashboard/           # 10 user/agent pages
│   │   ├── page.tsx         # Role-adaptive dashboard
│   │   ├── listings/        # Agent property management
│   │   ├── leads/           # Agent lead tracking
│   │   ├── profile/         # Profile settings
│   │   ├── notifications/   # Notification center
│   │   ├── saved-searches/  # Search alerts
│   │   ├── requests/        # Property requests
│   │   ├── cooperatives/    # Cooperative membership
│   │   ├── subscription/    # Agent subscription
│   │   └── security/        # Passkey management
│   └── properties/          # Public listing pages
├── components/              # Reusable UI components
├── hooks/                   # useAuth, usePasskey, etc.
├── lib/                     # Utilities, validation schemas
├── store/api/               # RTK Query API slices
│   ├── baseApi.ts           # Base config with auth headers
│   ├── authApi.ts           # Auth endpoints
│   ├── agentApi.ts          # Agent endpoints
│   └── adminApi.ts          # Admin endpoints
└── types/                   # TypeScript interfaces
```

### State Management

RTK Query handles all server state with automatic caching, invalidation, and optimistic updates:

```typescript
// API slice definition
export const propertyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<PropertyResponse, PropertyFilters>({
      query: (filters) => ({ url: '/properties', params: filters }),
      providesTags: ['Properties'],
    }),
  }),
});
```

### Authentication Flow

```
Registration:
  Phone → POST /auth/register → OTP sent via Termii
    → POST /auth/verify-otp → Sanctum token + refresh token
      → Set HttpOnly cookies (access_token, refresh_token, is_logged_in)

Login:
  Phone → POST /auth/login → OTP sent
    → POST /auth/verify-otp → tokens issued

Passkey (optional):
  POST /passkeys/register/options → WebAuthn challenge
    → Browser navigator.credentials.create() → POST /passkeys/register
  Login: POST /passkeys/authenticate/options → challenge
    → navigator.credentials.get() → POST /passkeys/authenticate → tokens

Token refresh:
  POST /auth/refresh (refresh_token cookie) → new access_token
```

### Middleware (Next.js)

The Next.js middleware (`middleware.ts`) handles:
- **Auth guard**: Redirects unauthenticated users from `/admin`, `/dashboard`, `/agent` to `/login`
- **CSP headers**: Nonce-based script-src, Cloudinary/PayStack/Sentry allowed origins
- **Cache control**: Public pages (60s), static pages (1h), authenticated pages (no-cache)

---

## API Design

### Versioning

All endpoints are prefixed with `/api/v1`. The version is in the URL path, not headers.

### Route Groups & Counts

| Scope | Auth | Endpoints | Examples |
|-------|------|-----------|---------|
| **Public** | None | ~35 | Properties, search, agents, blog, locations, estates |
| **Authenticated** | Sanctum | ~25 | Profile, saved properties, cooperatives, notifications |
| **Agent** | Sanctum + role | ~20 | Property CRUD, leads, verification, subscriptions |
| **Admin** | Sanctum + role | ~40 | Moderation, CMS, commissions, activity logs |
| **Super Admin** | Sanctum + role | 5 | Team management, system settings |
| **Webhooks** | Signature | 2 | Paystack, Termii |

### Response Format

All responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": { ... },
  "meta": { "current_page": 1, "last_page": 5, "total": 100 }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "phone": ["Phone must be a valid Nigerian number"] }
}
```

---

## Database

PostgreSQL 16 with PostGIS 3.4. See [database.md](database.md) for the full schema reference.

Key design decisions:
- **UUID primary keys** (v4, application-generated)
- **Money in kobo** (integers, never floats) — 1 Naira = 100 kobo
- **PII encryption** on leads table (full_name, email, phone) with blind indexes
- **Soft deletes** on users, properties, cooperatives
- **PostGIS** for geospatial queries (nearby search, map clustering)
- **Full-text search** indexes on property titles and descriptions

---

## External Services

### Termii (SMS/OTP)
- Sends 6-digit OTP codes for registration, login, password reset
- OTP codes stored as HMAC hashes (`code_hash`), never plaintext
- Rate limited: 5 attempts per minute per phone

### Paystack (Payments)
- Agent subscription payments (NGN, kobo)
- Cooperative contribution payments
- Webhook verification via HMAC signature
- Idempotent webhook processing via `processed_webhooks` table

### Cloudinary (Media)
- Property images with auto-optimization and thumbnails
- 360° video tours and floor plans
- Organized in folders: `ancerlarins/properties/{id}/`

### Sentry (Error Tracking)
- Backend: Laravel Sentry integration
- Frontend: Next.js Sentry SDK
- Source maps uploaded on build

---

## Infrastructure

### Docker Services (Production)

| Service | Image | Memory | Purpose |
|---------|-------|--------|---------|
| postgres | postgis/postgis:16-3.4 | 1 GB | Primary database |
| redis | redis:7-alpine | 512 MB | Cache, queues, sessions |
| pgbouncer | bitnami/pgbouncer:1.22 | 128 MB | Connection pooling (200 max) |
| backend | Custom PHP-FPM | 512 MB | Laravel API |
| worker | Custom PHP-FPM | 256 MB | Queue worker (Redis driver) |
| scheduler | Custom PHP-FPM | 256 MB | Cron scheduler |
| frontend | Custom Node.js | 512 MB | Next.js standalone |
| nginx | nginx:1.25-alpine | 256 MB | Reverse proxy + SSL |
| backup | postgis:16-3.4 | 256 MB | Daily pg_dump + S3 upload |
| certbot | certbot:v2.9.0 | 128 MB | Let's Encrypt auto-renewal |
| prometheus | prom/prometheus:v2.51 | 512 MB | Metrics collection |
| alertmanager | prom/alertmanager:v0.27 | 128 MB | Alert routing |
| grafana | grafana/grafana:10.4 | 256 MB | Dashboards |
| loki | grafana/loki:2.9.6 | 256 MB | Log aggregation |
| promtail | grafana/promtail:2.9.6 | 128 MB | Log shipping |
| node-exporter | prom/node-exporter:v1.7 | 128 MB | Host metrics |
| nginx-exporter | nginx-prometheus-exporter | 64 MB | Nginx metrics |
| postgres-exporter | postgres-exporter:v0.15 | 64 MB | PostgreSQL metrics |
| redis-exporter | redis_exporter:v1.58 | 64 MB | Redis metrics |

**Total memory allocation: ~5 GB**

### Security

- **No-new-privileges** on all containers
- **Capabilities dropped** (`CAP_DROP: ALL`) with minimal add-backs
- **PgBouncer** in transaction pooling mode (prevents connection exhaustion)
- **Sanctum tokens** with HttpOnly cookies (no localStorage)
- **HMAC-hashed OTP codes** (never stored in plaintext)
- **CSP headers** with nonce-based script execution
- **Rate limiting** on all auth and write endpoints
- **Encrypted PII** on leads with blind indexes for search

### Monitoring Stack

```
Application → Prometheus (metrics) → Grafana (dashboards)
           → Loki (logs via Promtail) → Grafana (log explorer)
           → Sentry (errors) → Sentry dashboard
           → Alertmanager → Email/Slack alerts
```

Exporters scrape: Nginx, PostgreSQL, Redis, and host metrics.

---

## Data Flow Examples

### Property Listing Flow
```
Agent submits property
  → FormRequest validates (title, price, location, images)
  → PropertyService creates with status=pending, calculates fraud_score
  → CloudinaryService uploads images (async via queue)
  → Admin reviews in moderation queue
  → Admin approves → status=approved → visible in search
```

### Lead/Inquiry Flow
```
Buyer clicks "Contact Agent" or "WhatsApp"
  → POST /inquiries (guest-friendly, rate limited)
  → Lead created with encrypted PII
  → Agent notified (push + in-app)
  → Agent responds (updates responded_at)
  → Admin can view full pipeline, reassign, update status
```

### Cooperative Flow
```
User creates cooperative (name, target amount, location)
  → Status: forming
  → Other users join
  → Members contribute via Paystack
  → Contributions tracked (pending → verified via webhook)
  → Target reached → status: target_reached
  → Admin finalizes → status: completed
```
