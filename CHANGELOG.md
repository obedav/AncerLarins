# Changelog

All notable changes to AncerLarins are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- **Passkey Authentication (WebAuthn/FIDO2)** — Passwordless sign-in with biometrics. Users can register and manage multiple passkeys from the dashboard security page.
- **Super Admin Team Management** — Promote users to admin, demote admins, manage team from dedicated admin panel page.
- **System Settings Page** — Super admins can configure platform settings from the admin panel.
- **Inquiry Pipeline** — Full lead management system with status tracking, assignment, and document attachments. Guest-friendly inquiry submission with rate limiting.
- **Commission Tracking** — Admin revenue page with commission recording, status management (pending/invoiced/paid/cancelled), and summary statistics.
- **Scraped Listing Pipeline** — Import external listings with deduplication scoring and admin review queue.
- **Security Headers Middleware** — HSTS, X-Frame-Options, X-Content-Type-Options applied on all responses.
- **Database Backup Container** — Automated daily `pg_dump` with 7-day retention and optional S3 upload.
- **Monitoring Stack** — Prometheus, Grafana, Loki, Promtail, Alertmanager with PostgreSQL, Redis, Nginx, and host exporters.
- **PgBouncer** — Connection pooling (transaction mode, 200 max connections) between Laravel and PostgreSQL.
- **CSP Nonce** — Content Security Policy with per-request nonces for script execution.
- **Phone Normalization** — Registration and login normalize Nigerian phone numbers (07xxx → +234xxx) before validation.

### Enhanced
- **Full Dashboard UI/UX Overhaul** — All 28+ admin, agent, and user dashboard pages redesigned with modern patterns: gradient banners, stat cards with trends, segmented tabs, polished modals with backdrop blur, empty states, skeleton loaders, and responsive mobile layouts.
- **Admin Layout** — Gold accent border, shield icon ADMIN badge, mobile hamburger menu with sidebar overlay.
- **Dashboard Layout** — Shadow header, avatar status indicator, mobile gold accent tabs.
- **Dashboard Sidebar** — Section groups (Main/Discover/Account), active left accent bar, notification count badge.
- **Agent Onboarding** — Gold gradient card with progress bar and celebration text.
- **Notification Bell** — Dropdown animation, type-based icons, polished shadow.

### Fixed
- **React Hooks Ordering** — Fixed "Rendered fewer hooks than expected" error on registration page by moving all hooks above the early return guard.
- **Phone Uniqueness Validation** — Fixed raw SQL error leaking to frontend when registering with an existing phone number. Added `prepareForValidation()` to normalize phone before the `unique` validation rule runs.
- **CSP Dev Mode** — Fixed "Failed to fetch" errors during Next.js navigation caused by `upgrade-insecure-requests` directive forcing HTTP→HTTPS on localhost. Directive is now production-only.
- **Wrong Column Name** — Fixed `rejectAgent` using incorrect column name.
- **Missing AuthorizesRequests Trait** — Fixed Docker build failure from missing trait.

### Security
- All Docker containers run with `no-new-privileges` and dropped capabilities.
- OTP codes stored as HMAC hashes, never plaintext.
- PII fields on leads encrypted with blind indexes for search.
- Rate limiting on all auth endpoints (5 req/min for register/login, 5 req/min for OTP verify).
- Webhook signature verification for Paystack and Termii.
- HttpOnly cookies for authentication tokens (no localStorage).

---

## [0.1.0] - 2026-02-15

### Added
- Initial platform release.
- Property listing, search, and detail pages.
- Agent registration and verification workflow.
- OTP-based authentication via Termii.
- Property image upload via Cloudinary.
- Neighborhood intelligence (safety, transport, amenity scores).
- Estate directory with resident reviews.
- Cooperative buying with Paystack payments.
- Property requests (reverse listings).
- Blog CMS for market guides and area spotlights.
- Admin dashboard with property and agent moderation.
- Saved properties and saved searches with alerts.
- Docker Compose development environment (PostgreSQL + Redis).
