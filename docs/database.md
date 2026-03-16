# Database Schema

## Overview

AncerLarins uses **PostgreSQL 16** with **PostGIS 3.4** for geospatial queries. The database contains **41 tables** organized into functional domains. All primary keys use UUIDs. Timestamps use timezone-aware columns.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS & AUTH                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌─────────────────┐    ┌──────────────┐               │
│  │  users    │───►│ agent_profiles  │───►│ agent_       │               │
│  │          │    │                 │    │ subscriptions │               │
│  │ id (uuid)│    │ verification_   │    └──────────────┘               │
│  │ phone    │    │ status          │                                    │
│  │ email    │    │ company_name    │    ┌──────────────┐               │
│  │ role     │    │ total_leads     │    │ agent_reviews│               │
│  │ status   │    │ avg_rating      │◄───│              │               │
│  └────┬─────┘    └─────────────────┘    └──────────────┘               │
│       │                                                                 │
│       ├──► otp_codes                                                    │
│       ├──► refresh_tokens                                               │
│       ├──► webauthn_credentials                                         │
│       ├──► personal_access_tokens (Sanctum)                             │
│       ├──► push_tokens                                                  │
│       └──► sessions                                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             PROPERTIES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────────┐         │
│  │  properties   │───►│ property_images │    │ property_types │         │
│  │              │    └─────────────────┘    └────────┬───────┘         │
│  │ id (uuid)    │                                    │                  │
│  │ agent_id ────┤    ┌─────────────────┐             │                  │
│  │ property_    │◄───┤ amenities       │ (many-to-many via              │
│  │   type_id ───┘    └─────────────────┘  property_amenities)          │
│  │ listing_type │                                                       │
│  │ price_kobo   │    ┌─────────────────┐    ┌────────────────┐         │
│  │ status       │───►│ virtual_tours   │    │ price_history  │         │
│  │ state_id     │    └─────────────────┘    └────────────────┘         │
│  │ city_id      │                                                       │
│  │ area_id      │    ┌─────────────────┐    ┌────────────────┐         │
│  │ estate_id    │───►│ property_views  │    │ saved_         │         │
│  │ fraud_score  │    └─────────────────┘    │ properties     │         │
│  │ latitude     │                           └────────────────┘         │
│  │ longitude    │                                                       │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          LEADS & INQUIRIES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  leads        │───►│ documents    │    │ commissions  │              │
│  │              │    └──────────────┘    └──────────────┘              │
│  │ property_id   │                                                      │
│  │ agent_id      │    PII fields are encrypted:                         │
│  │ user_id       │    - full_name (encrypted)                           │
│  │ contact_type  │    - email (encrypted) + email_hash (blind index)    │
│  │ full_name *   │    - phone (encrypted)                               │
│  │ email *       │                                                      │
│  │ phone *       │                                                      │
│  │ responded_at  │                                                      │
│  │ qualified_at  │                                                      │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            GEOGRAPHY                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐      │
│  │  states   │───►│  cities  │───►│  areas   │───►│  landmarks   │      │
│  │          │    │          │    │          │    │              │      │
│  │ name     │    │ name     │    │ name     │    │ name         │      │
│  │ code     │    │ code     │    │ slug     │    │ latitude     │      │
│  └──────────┘    └──────────┘    └──────────┘    │ longitude    │      │
│                                       │          └──────────────┘      │
│                                       │                                 │
│                                       ├──► estates                      │
│                                       ├──► neighborhood_reviews         │
│                                       └──► external_price_data          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          COOPERATIVES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐    ┌─────────────────────┐                       │
│  │  cooperatives     │───►│ cooperative_members  │                       │
│  │                  │    │                     │                       │
│  │ admin_user_id    │    │ user_id             │                       │
│  │ target_amount    │    │ role (member/admin/  │                       │
│  │ status           │    │   treasurer)         │                       │
│  │ member_count     │    └──────────┬──────────┘                       │
│  └──────────────────┘               │                                   │
│                          ┌──────────▼──────────┐                       │
│                          │ cooperative_         │                       │
│                          │ contributions        │                       │
│                          │                     │                       │
│                          │ amount_kobo         │                       │
│                          │ status (pending/     │                       │
│                          │   verified/failed)   │                       │
│                          │ paystack_reference   │                       │
│                          └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Table Reference

### Users & Authentication

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | All platform users | id, phone, email, first_name, last_name, role (user/agent/admin/super_admin), status, phone_verified, banned_at |
| `agent_profiles` | Agent-specific data | user_id, company_name, verification_status, subscription_tier, total_leads, avg_rating, specializations |
| `agent_subscriptions` | Subscription history | agent_id, tier, starts_at, ends_at, amount_kobo |
| `otp_codes` | Phone verification codes | phone, code_hash (HMAC), purpose, expires_at, attempts |
| `refresh_tokens` | JWT-like refresh tokens | user_id, token_hash (SHA-256), expires_at, revoked_at |
| `webauthn_credentials` | Passkey registrations | user_id, credential_id, public_key, sign_count |
| `personal_access_tokens` | Sanctum API tokens | tokenable_id, name, token, abilities, last_used_at |
| `push_tokens` | FCM device tokens | user_id, token, device_type |

### Properties

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `properties` | Property listings | agent_id, listing_type (rent/sale/short_let), property_type_id, price_kobo, status, state/city/area_id, estate_id, latitude, longitude, fraud_score |
| `property_images` | Listing photos | property_id, url, thumbnail_url, cloudinary_public_id, is_cover, sort_order |
| `property_types` | Categories | name, icon, code |
| `amenities` | Features (pool, gym, etc.) | name, icon |
| `property_amenities` | Many-to-many pivot | property_id, amenity_id |
| `virtual_tours` | Video tours | property_id, type (video360/walkthrough/floorplan), url, cloudinary_public_id |
| `property_views` | View analytics | property_id, user_id, viewed_at |
| `price_history` | Price changes over time | property_id, price_kobo, recorded_at |
| `saved_properties` | User favorites | user_id, property_id |

### Leads & Revenue

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `leads` | Property inquiries | property_id, agent_id, user_id, contact_type, full_name*, email*, phone*, source, responded_at, qualified_at |
| `documents` | Lead-attached files | lead_id, uploaded_by, type, file_path, status |
| `commissions` | Agent commissions | property_id, agent_id, amount_kobo, percentage, status (pending/invoiced/paid/cancelled) |

> \* Encrypted fields with blind indexes

### Geography

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `states` | Nigerian states | name, code |
| `cities` | Cities within states | state_id, name, code |
| `areas` | Neighborhoods within cities | city_id, name, slug |
| `landmarks` | Points of interest | area_id, name, latitude, longitude |
| `estates` | Residential estates | area_id, name, estate_type, developer, amenities (JSON), security_type |
| `estate_reviews` | Resident reviews | estate_id, reviewer_id, rating, review_text |
| `neighborhood_reviews` | Area reviews | area_id, reviewer_id, category, rating, review_text |
| `external_price_data` | Market data | area_id, avg_price_kobo, data_source, recorded_date |

### Content & Community

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `blog_posts` | Blog CMS | author_id, title, slug, content, category, status, published_at |
| `property_requests` | Reverse listings | user_id, title, listing_type, budget range, bedrooms, status |
| `property_request_responses` | Agent responses to requests | request_id, agent_id, property_id, status |
| `cooperatives` | Group buying | admin_user_id, name, target_amount_kobo, status, member_count |
| `cooperative_members` | Membership | cooperative_id, user_id, role, status |
| `cooperative_contributions` | Payments | cooperative_id, member_id, amount_kobo, status, reference |
| `saved_searches` | Search alerts | user_id, name, search params (JSON), frequency |

### Platform Operations

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `notifications` | User notifications | user_id, type, title, body, action_url, is_read |
| `activity_logs` | Audit trail | user_id, action, target_type, target_id, ip_address |
| `reports` | Content reports | reporter_id, reportable (polymorphic), reason, status |
| `agent_reviews` | Agent ratings | agent_id, reviewer_id, lead_id, rating, review_text |
| `scraped_listings` | External listing imports | source, source_url, title, price_kobo, status, dedup_score |
| `search_logs` | Search analytics | user_id, query, filters (JSON) |
| `processed_webhooks` | Webhook idempotency | event_id, provider, processed_at |
| `whatsapp_conversations` | Bot conversations | user_id, property_id, agent_id, session_state |
| `mortgage_inquiries` | Mortgage leads | user_id, property_id, loan_amount_kobo, term_months |

---

## Enums

### User & Auth
| Enum | Values |
|------|--------|
| UserRole | `user`, `agent`, `admin`, `super_admin` |
| UserStatus | `active`, `suspended`, `banned`, `deactivated` |
| VerificationStatus | `unverified`, `pending`, `verified`, `rejected` |
| OtpPurpose | `registration`, `login`, `password_reset` |
| SubscriptionTier | `free`, `basic`, `pro`, `enterprise` |

### Property
| Enum | Values |
|------|--------|
| PropertyStatus | `draft`, `pending`, `approved`, `rejected`, `expired`, `rented`, `sold`, `archived` |
| ListingType | `rent`, `sale`, `short_let` |
| Furnishing | `furnished`, `semi_furnished`, `unfurnished` |
| EstateType | `gated_estate`, `open_estate`, `highrise`, `mixed_use` |

### Leads & Content
| Enum | Values |
|------|--------|
| ContactType | `whatsapp`, `call`, `form` |
| ReportReason | `fraud`, `inaccurate`, `offensive`, `spam`, `other` |
| ReportStatus | `open`, `resolved`, `dismissed` |
| BlogPostCategory | `guide`, `market_report`, `tips`, `news`, `area_spotlight` |
| BlogPostStatus | `draft`, `published`, `archived` |

### Cooperatives
| Enum | Values |
|------|--------|
| CooperativeStatus | `forming`, `active`, `target_reached`, `completed`, `dissolved` |
| CooperativeMemberRole | `member`, `admin`, `treasurer` |
| ContributionStatus | `pending`, `verified`, `failed`, `refunded` |

---

## Indexes & Performance

Key performance indexes applied:

- `properties`: Composite index on (`status`, `listing_type`, `city_id`), GiST index on geography column
- `leads`: Index on (`agent_id`, `responded_at`), index on `email_hash` (blind index)
- `property_views`: Index on (`property_id`, `viewed_at`)
- `otp_codes`: Index on (`phone`, `purpose`, `expires_at`)
- `activity_logs`: Index on (`user_id`, `created_at`)
- `scraped_listings`: Index on (`source`, `status`)
- Full-text search indexes on `properties.title`, `properties.description`, `blog_posts.title`

---

## Conventions

- **Primary keys**: UUID v4 (generated by application, not database)
- **Timestamps**: `created_at`, `updated_at` (timezone-aware)
- **Soft deletes**: Applied on `users`, `properties`, `cooperatives`
- **Money**: Stored in kobo (1/100 of Naira) as integers — never floats
- **Foreign keys**: `RESTRICT` on delete by default (prevents accidental data loss)
- **Encryption**: Laravel's `encrypt()`/`decrypt()` for PII fields on `leads`
