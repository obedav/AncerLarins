-- =============================================================================
-- Complete PostgreSQL Database Schema
-- Generated from Laravel migrations
-- =============================================================================

-- Enable PostGIS extension (required for geography columns)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('user', 'agent', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deactivated');
CREATE TYPE otp_purpose AS ENUM ('registration', 'login', 'password_reset', 'phone_change');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE id_document_type AS ENUM ('NIN', 'drivers_license', 'voters_card');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE agent_subscription_status AS ENUM ('active', 'expired', 'cancelled', 'refunded');
-- NOTE: properties.listing_type and properties.rent_period use VARCHAR + CHECK constraints
-- (not enum types) because later migrations expanded the allowed values.
CREATE TYPE furnishing_type AS ENUM ('furnished', 'semi_furnished', 'unfurnished');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'expired', 'rented', 'sold', 'archived');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE report_reason AS ENUM ('scam', 'fake_listing', 'wrong_price', 'wrong_photos', 'already_rented', 'harassment', 'spam', 'other');
CREATE TYPE report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE saved_search_frequency AS ENUM ('instant', 'daily', 'weekly');
CREATE TYPE neighborhood_review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE tour_type AS ENUM ('video', '360', '3d_model');
CREATE TYPE blog_category AS ENUM ('guide', 'market_report', 'tips', 'news', 'area_spotlight');
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE property_request_listing_type AS ENUM ('rent', 'sale', 'short_let');
CREATE TYPE property_request_status AS ENUM ('active', 'fulfilled', 'expired', 'cancelled');
CREATE TYPE property_request_response_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE lead_contact_type AS ENUM ('whatsapp', 'call', 'form');

-- =============================================================================
-- TABLE: cache
-- =============================================================================

CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- =============================================================================
-- TABLE: cache_locks
-- =============================================================================

CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- =============================================================================
-- TABLE: jobs
-- =============================================================================

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX jobs_queue_index ON jobs (queue);

-- =============================================================================
-- TABLE: job_batches
-- =============================================================================

CREATE TABLE job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT,
    cancelled_at INTEGER,
    created_at INTEGER NOT NULL,
    finished_at INTEGER
);

-- =============================================================================
-- TABLE: failed_jobs
-- =============================================================================

CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABLE: states
-- =============================================================================

CREATE TABLE states (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- =============================================================================
-- TABLE: cities
-- =============================================================================

CREATE TABLE cities (
    id UUID PRIMARY KEY,
    state_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT cities_state_id_slug_unique UNIQUE (state_id, slug),
    CONSTRAINT cities_state_id_foreign FOREIGN KEY (state_id) REFERENCES states (id) ON DELETE RESTRICT
);

-- =============================================================================
-- TABLE: areas
-- =============================================================================

CREATE TABLE areas (
    id UUID PRIMARY KEY,
    city_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    avg_rent_1br BIGINT,
    avg_rent_2br BIGINT,
    avg_rent_3br BIGINT,
    avg_buy_price_sqm BIGINT,
    safety_score NUMERIC(3, 1),
    traffic_score NUMERIC(3, 1),
    amenity_score NUMERIC(3, 1),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    location geography(Point, 4326),

    CONSTRAINT areas_city_id_slug_unique UNIQUE (city_id, slug),
    CONSTRAINT areas_city_id_foreign FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE RESTRICT
);

CREATE INDEX areas_location_gist ON areas USING GIST (location);

-- =============================================================================
-- TABLE: landmarks
-- =============================================================================

CREATE TABLE landmarks (
    id UUID PRIMARY KEY,
    area_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    location geography(Point, 4326),

    CONSTRAINT landmarks_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT
);

CREATE INDEX landmarks_location_gist ON landmarks USING GIST (location);

-- =============================================================================
-- TABLE: users
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(255) NOT NULL UNIQUE,
    avatar_url VARCHAR(255),
    password_hash VARCHAR(255),
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role user_role NOT NULL DEFAULT 'user',
    status user_status NOT NULL DEFAULT 'active',
    ban_reason TEXT,
    banned_at TIMESTAMPTZ,
    banned_by UUID,
    preferred_city_id UUID,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT users_preferred_city_id_foreign FOREIGN KEY (preferred_city_id) REFERENCES cities (id) ON DELETE SET NULL,
    CONSTRAINT users_banned_by_foreign FOREIGN KEY (banned_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX users_role_index ON users (role);
CREATE INDEX users_status_index ON users (status);

-- =============================================================================
-- TABLE: otp_codes
-- (After rename migration: column is code_hash VARCHAR(128))
-- =============================================================================

CREATE TABLE otp_codes (
    id UUID PRIMARY KEY,
    phone VARCHAR(255) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    purpose otp_purpose NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX otp_codes_phone_purpose_expires_at_index ON otp_codes (phone, purpose, expires_at);

-- =============================================================================
-- TABLE: refresh_tokens
-- =============================================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT refresh_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX refresh_tokens_user_id_index ON refresh_tokens (user_id);

-- =============================================================================
-- TABLE: property_types
-- =============================================================================

CREATE TABLE property_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- =============================================================================
-- TABLE: agent_profiles
-- (Includes columns added by 2026_02_21 verification document fields migration)
-- =============================================================================

CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    company_name VARCHAR(255),
    logo_url VARCHAR(255),
    license_number VARCHAR(255),
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    rejection_reason TEXT,
    id_document_type id_document_type,
    id_document_number VARCHAR(100),
    id_document_url VARCHAR(255),
    id_document_front_url VARCHAR(255),
    id_document_front_public_id VARCHAR(255),
    id_document_back_url VARCHAR(255),
    id_document_back_public_id VARCHAR(255),
    selfie_url VARCHAR(255),
    selfie_public_id VARCHAR(255),
    cac_document_url VARCHAR(255),
    cac_document_public_id VARCHAR(255),
    whatsapp_number VARCHAR(255),
    office_address VARCHAR(255),
    office_area_id UUID,
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    max_listings INTEGER NOT NULL DEFAULT 3,
    active_listings INTEGER NOT NULL DEFAULT 0,
    total_listings INTEGER NOT NULL DEFAULT 0,
    total_leads INTEGER NOT NULL DEFAULT 0,
    avg_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    response_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    avg_response_time INTEGER,
    bio TEXT,
    specializations JSONB,
    years_experience INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT agent_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT agent_profiles_verified_by_foreign FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT agent_profiles_office_area_id_foreign FOREIGN KEY (office_area_id) REFERENCES areas (id) ON DELETE SET NULL
);

CREATE INDEX agent_profiles_verification_status_index ON agent_profiles (verification_status);
CREATE INDEX agent_profiles_subscription_tier_index ON agent_profiles (subscription_tier);

-- =============================================================================
-- TABLE: agent_subscriptions
-- =============================================================================

CREATE TABLE agent_subscriptions (
    id UUID PRIMARY KEY,
    agent_profile_id UUID NOT NULL,
    tier VARCHAR(255) NOT NULL,
    amount_kobo BIGINT NOT NULL,
    payment_reference VARCHAR(255),
    payment_provider VARCHAR(255),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status agent_subscription_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT agent_subscriptions_agent_profile_id_foreign FOREIGN KEY (agent_profile_id) REFERENCES agent_profiles (id) ON DELETE CASCADE
);

CREATE INDEX agent_subscriptions_agent_profile_id_index ON agent_subscriptions (agent_profile_id);

-- =============================================================================
-- TABLE: estates
-- =============================================================================

CREATE TABLE estates (
    id UUID PRIMARY KEY,
    area_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    estate_type VARCHAR(255) NOT NULL DEFAULT 'gated_estate',
    developer VARCHAR(255),
    year_built SMALLINT,
    total_units INTEGER,
    amenities JSONB,
    security_type VARCHAR(255),
    service_charge_kobo BIGINT,
    service_charge_period VARCHAR(255),
    electricity_source VARCHAR(255),
    water_source VARCHAR(255),
    cover_image_url VARCHAR(255),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT estates_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT
);

CREATE INDEX estates_area_id_index ON estates (area_id);
CREATE INDEX estates_estate_type_index ON estates (estate_type);
CREATE INDEX estates_slug_index ON estates (slug);

-- =============================================================================
-- TABLE: properties
-- (Includes columns from short_let, fraud, and estate_id migrations)
-- (Enum constraints updated for short_let values)
-- =============================================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL,
    listing_type VARCHAR(255) NOT NULL,
    property_type_id UUID NOT NULL,

    -- Core
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,

    -- Pricing (all in kobo)
    price_kobo BIGINT NOT NULL,
    price_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    rent_period VARCHAR(255),
    agency_fee_pct NUMERIC(5, 2),
    caution_fee_kobo BIGINT,
    service_charge_kobo BIGINT,
    legal_fee_kobo BIGINT,

    -- Location
    state_id UUID NOT NULL,
    city_id UUID NOT NULL,
    area_id UUID NOT NULL,
    estate_id UUID,
    address VARCHAR(255) NOT NULL,
    landmark_note VARCHAR(255),
    location_fuzzy BOOLEAN NOT NULL DEFAULT TRUE,

    -- Features
    bedrooms SMALLINT NOT NULL DEFAULT 0,
    bathrooms SMALLINT NOT NULL DEFAULT 0,
    toilets SMALLINT NOT NULL DEFAULT 0,
    sitting_rooms SMALLINT NOT NULL DEFAULT 0,
    floor_area_sqm NUMERIC(10, 2),
    land_area_sqm NUMERIC(10, 2),
    floor_number SMALLINT,
    total_floors SMALLINT,
    year_built SMALLINT,

    -- Amenities (boolean flags)
    furnishing furnishing_type NOT NULL DEFAULT 'unfurnished',
    parking_spaces SMALLINT NOT NULL DEFAULT 0,
    has_bq BOOLEAN NOT NULL DEFAULT FALSE,
    has_swimming_pool BOOLEAN NOT NULL DEFAULT FALSE,
    has_gym BOOLEAN NOT NULL DEFAULT FALSE,
    has_cctv BOOLEAN NOT NULL DEFAULT FALSE,
    has_generator BOOLEAN NOT NULL DEFAULT FALSE,
    has_water_supply BOOLEAN NOT NULL DEFAULT FALSE,
    has_prepaid_meter BOOLEAN NOT NULL DEFAULT FALSE,
    is_serviced BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_build BOOLEAN NOT NULL DEFAULT FALSE,

    -- Availability
    available_from DATE,
    inspection_available BOOLEAN NOT NULL DEFAULT TRUE,

    -- Status & moderation
    status property_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    fraud_score SMALLINT NOT NULL DEFAULT 0,
    fraud_flags JSONB,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    featured_until TIMESTAMPTZ,

    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(255),

    -- Counters
    view_count INTEGER NOT NULL DEFAULT 0,
    save_count INTEGER NOT NULL DEFAULT 0,
    contact_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,

    -- Phase 2 AI columns
    estimated_value_kobo BIGINT,
    valuation_confidence NUMERIC(5, 4),
    last_valued_at TIMESTAMPTZ,

    -- Short-let specific columns
    min_stay_days SMALLINT,
    max_stay_days SMALLINT,
    check_in_time TIME,
    check_out_time TIME,

    -- Lifecycle
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    location geography(Point, 4326),

    -- Foreign keys
    CONSTRAINT properties_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES agent_profiles (id) ON DELETE RESTRICT,
    CONSTRAINT properties_property_type_id_foreign FOREIGN KEY (property_type_id) REFERENCES property_types (id) ON DELETE RESTRICT,
    CONSTRAINT properties_state_id_foreign FOREIGN KEY (state_id) REFERENCES states (id) ON DELETE RESTRICT,
    CONSTRAINT properties_city_id_foreign FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE RESTRICT,
    CONSTRAINT properties_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT,
    CONSTRAINT properties_estate_id_foreign FOREIGN KEY (estate_id) REFERENCES estates (id) ON DELETE SET NULL,
    CONSTRAINT properties_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,

    -- Check constraints for listing_type and rent_period (expanded for short_let)
    CONSTRAINT properties_listing_type_check CHECK (listing_type::text = ANY (ARRAY['rent'::text, 'sale'::text, 'short_let'::text])),
    CONSTRAINT properties_rent_period_check CHECK (rent_period::text = ANY (ARRAY['yearly'::text, 'monthly'::text, 'quarterly'::text, 'weekly'::text, 'daily'::text]))
);

-- Single-column indexes
CREATE INDEX properties_agent_id_index ON properties (agent_id);
CREATE INDEX properties_status_index ON properties (status);
CREATE INDEX properties_listing_type_index ON properties (listing_type);
CREATE INDEX properties_property_type_id_index ON properties (property_type_id);
CREATE INDEX properties_price_kobo_index ON properties (price_kobo);
CREATE INDEX properties_area_id_index ON properties (area_id);
CREATE INDEX properties_city_id_index ON properties (city_id);
CREATE INDEX properties_state_id_index ON properties (state_id);
CREATE INDEX properties_featured_index ON properties (featured);
CREATE INDEX properties_estate_id_index ON properties (estate_id);

-- Composite index for browse queries
CREATE INDEX properties_browse_idx ON properties (status, listing_type, city_id, property_type_id, price_kobo);

-- PostGIS spatial index
CREATE INDEX properties_location_gist ON properties USING GIST (location);

-- Full-text search GIN index
CREATE INDEX properties_fulltext_idx ON properties USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Performance indexes (from 2026_03_03 migration)
CREATE INDEX idx_properties_status_published ON properties (status, published_at);
CREATE INDEX idx_properties_agent_status ON properties (agent_id, status);
CREATE INDEX idx_properties_featured ON properties (featured, featured_until);

-- =============================================================================
-- TABLE: property_images
-- (Includes cloudinary_public_id from 2026_02_24 migration)
-- =============================================================================

CREATE TABLE property_images (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    watermarked_url VARCHAR(255),
    cloudinary_public_id VARCHAR(255),
    caption VARCHAR(255),
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    width SMALLINT,
    height SMALLINT,
    file_size_bytes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT property_images_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT
);

CREATE INDEX property_images_property_id_sort_order_index ON property_images (property_id, sort_order);

-- =============================================================================
-- TABLE: amenities
-- =============================================================================

CREATE TABLE amenities (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255),
    icon VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- =============================================================================
-- TABLE: property_amenities (junction table)
-- =============================================================================

CREATE TABLE property_amenities (
    property_id UUID NOT NULL,
    amenity_id UUID NOT NULL,

    PRIMARY KEY (property_id, amenity_id),
    CONSTRAINT property_amenities_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
    CONSTRAINT property_amenities_amenity_id_foreign FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE
);

-- =============================================================================
-- TABLE: saved_properties
-- =============================================================================

CREATE TABLE saved_properties (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT saved_properties_user_id_property_id_unique UNIQUE (user_id, property_id),
    CONSTRAINT saved_properties_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT saved_properties_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
);

CREATE INDEX saved_properties_user_id_index ON saved_properties (user_id);

-- =============================================================================
-- TABLE: saved_searches
-- =============================================================================

CREATE TABLE saved_searches (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    listing_type VARCHAR(255),
    property_type_id UUID,
    city_id UUID,
    area_ids JSONB,
    min_price_kobo BIGINT,
    max_price_kobo BIGINT,
    min_bedrooms SMALLINT,
    max_bedrooms SMALLINT,
    furnishing VARCHAR(255),
    additional_filters JSONB,
    notify_push BOOLEAN NOT NULL DEFAULT FALSE,
    notify_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    notify_email BOOLEAN NOT NULL DEFAULT FALSE,
    frequency saved_search_frequency NOT NULL DEFAULT 'daily',
    last_notified_at TIMESTAMPTZ,
    match_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT saved_searches_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT saved_searches_property_type_id_foreign FOREIGN KEY (property_type_id) REFERENCES property_types (id) ON DELETE SET NULL,
    CONSTRAINT saved_searches_city_id_foreign FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE SET NULL
);

CREATE INDEX saved_searches_user_id_index ON saved_searches (user_id);
CREATE INDEX saved_searches_is_active_index ON saved_searches (is_active);

-- =============================================================================
-- TABLE: leads
-- (Includes all columns from inquiry, qualification, inspection/agreement,
--  email_hash, widened PII columns, and updated FK constraints)
-- =============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY,
    tracking_ref VARCHAR(12) UNIQUE,
    property_id UUID NOT NULL,
    agent_id UUID,
    user_id UUID,
    full_name TEXT,
    email TEXT,
    email_hash VARCHAR(64),
    phone TEXT,
    budget_range VARCHAR(50),
    timeline VARCHAR(30),
    financing_type VARCHAR(20),
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    qualification VARCHAR(30),
    assigned_to UUID,
    staff_notes TEXT,
    qualified_at TIMESTAMPTZ,
    inspection_at TIMESTAMPTZ,
    inspection_date DATE,
    inspection_time VARCHAR(10),
    inspection_location VARCHAR(500),
    inspection_notes VARCHAR(1000),
    closed_at TIMESTAMPTZ,
    agreement_accepted_at TIMESTAMP,
    agreement_ip VARCHAR(45),
    agreement_terms_version VARCHAR(20),
    contact_type lead_contact_type NOT NULL,
    source VARCHAR(255),
    utm_campaign VARCHAR(255),
    responded_at TIMESTAMPTZ,
    response_time_min INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT leads_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT,
    CONSTRAINT leads_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES agent_profiles (id) ON DELETE RESTRICT,
    CONSTRAINT leads_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT leads_assigned_to_foreign FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX leads_agent_id_index ON leads (agent_id);
CREATE INDEX leads_property_id_index ON leads (property_id);
CREATE INDEX leads_user_id_index ON leads (user_id);
CREATE INDEX leads_status_index ON leads (status);
CREATE INDEX leads_assigned_to_index ON leads (assigned_to);
CREATE INDEX leads_qualification_index ON leads (qualification);
CREATE INDEX leads_email_hash_index ON leads (email_hash);
CREATE INDEX leads_status_created_at_index ON leads (status, created_at);
CREATE INDEX leads_agent_id_status_index ON leads (agent_id, status);

-- =============================================================================
-- TABLE: agent_reviews
-- =============================================================================

CREATE TABLE agent_reviews (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL,
    user_id UUID,
    overall_rating NUMERIC(2, 1) NOT NULL,
    responsiveness NUMERIC(2, 1),
    honesty NUMERIC(2, 1),
    professionalism NUMERIC(2, 1),
    title VARCHAR(255),
    comment TEXT,
    status review_status NOT NULL DEFAULT 'pending',
    verified_interaction BOOLEAN NOT NULL DEFAULT FALSE,
    lead_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT agent_reviews_agent_id_user_id_unique UNIQUE (agent_id, user_id),
    CONSTRAINT agent_reviews_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES agent_profiles (id) ON DELETE RESTRICT,
    CONSTRAINT agent_reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT agent_reviews_lead_id_foreign FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL,

    CONSTRAINT agent_reviews_overall_check CHECK (overall_rating >= 1 AND overall_rating <= 5),
    CONSTRAINT agent_reviews_responsiveness_check CHECK (responsiveness IS NULL OR (responsiveness >= 1 AND responsiveness <= 5)),
    CONSTRAINT agent_reviews_honesty_check CHECK (honesty IS NULL OR (honesty >= 1 AND honesty <= 5)),
    CONSTRAINT agent_reviews_professionalism_check CHECK (professionalism IS NULL OR (professionalism >= 1 AND professionalism <= 5))
);

CREATE INDEX agent_reviews_agent_id_status_index ON agent_reviews (agent_id, status);

-- =============================================================================
-- TABLE: reports
-- =============================================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID,
    reportable_type VARCHAR(255) NOT NULL,
    reportable_id UUID NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    evidence_urls JSONB,
    status report_status NOT NULL DEFAULT 'open',
    resolved_by UUID,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT reports_reporter_id_foreign FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT reports_resolved_by_foreign FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX reports_status_index ON reports (status);
CREATE INDEX reports_reportable_type_reportable_id_index ON reports (reportable_type, reportable_id);

-- =============================================================================
-- TABLE: property_views
-- =============================================================================

CREATE TABLE property_views (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    source VARCHAR(255),
    device_type VARCHAR(255),
    duration_seconds INTEGER,
    viewed_images BOOLEAN NOT NULL DEFAULT FALSE,
    contacted_agent BOOLEAN NOT NULL DEFAULT FALSE,
    saved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT property_views_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
    CONSTRAINT property_views_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX property_views_property_id_created_at_index ON property_views (property_id, created_at);
CREATE INDEX property_views_user_id_index ON property_views (user_id);

-- =============================================================================
-- TABLE: search_logs
-- =============================================================================

CREATE TABLE search_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    session_id VARCHAR(255),
    query_text VARCHAR(255),
    listing_type VARCHAR(255),
    property_type_id UUID,
    city_id UUID,
    area_id UUID,
    min_price_kobo BIGINT,
    max_price_kobo BIGINT,
    bedrooms SMALLINT,
    filters_json JSONB,
    result_count INTEGER NOT NULL DEFAULT 0,
    clicked_property_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT search_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT search_logs_property_type_id_foreign FOREIGN KEY (property_type_id) REFERENCES property_types (id) ON DELETE SET NULL,
    CONSTRAINT search_logs_city_id_foreign FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE SET NULL,
    CONSTRAINT search_logs_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE SET NULL
);

CREATE INDEX search_logs_created_at_index ON search_logs (created_at);
CREATE INDEX search_logs_area_id_index ON search_logs (area_id);

-- =============================================================================
-- TABLE: activity_logs
-- =============================================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(255),
    target_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT activity_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX activity_logs_user_id_created_at_index ON activity_logs (user_id, created_at);
CREATE INDEX activity_logs_action_created_at_index ON activity_logs (action, created_at);
CREATE INDEX idx_activity_logs_user_created ON activity_logs (user_id, created_at);

-- =============================================================================
-- TABLE: notifications
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(255),
    action_type VARCHAR(255),
    action_id UUID,
    channels JSONB,
    sent_push BOOLEAN NOT NULL DEFAULT FALSE,
    sent_email BOOLEAN NOT NULL DEFAULT FALSE,
    sent_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX notifications_user_id_read_at_created_at_index ON notifications (user_id, read_at, created_at);

-- =============================================================================
-- TABLE: push_tokens
-- =============================================================================

CREATE TABLE push_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL,
    device_type VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT push_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Partial index: only active tokens
CREATE INDEX push_tokens_user_active ON push_tokens (user_id) WHERE is_active = true;

-- =============================================================================
-- TABLE: price_history
-- =============================================================================

CREATE TABLE price_history (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    price_kobo BIGINT NOT NULL,
    listing_type VARCHAR(255),
    recorded_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT price_history_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT
);

CREATE INDEX price_history_property_id_recorded_at_index ON price_history (property_id, recorded_at);
CREATE INDEX price_history_recorded_at_index ON price_history (recorded_at);

-- =============================================================================
-- TABLE: virtual_tours
-- (Includes cloudinary_public_id from 2026_03_05 migration)
-- =============================================================================

CREATE TABLE virtual_tours (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    tour_type tour_type NOT NULL,
    url VARCHAR(255) NOT NULL,
    cloudinary_public_id VARCHAR(255),
    thumbnail_url VARCHAR(255),
    duration_seconds INTEGER,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT virtual_tours_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT
);

-- =============================================================================
-- TABLE: neighborhood_reviews
-- =============================================================================

CREATE TABLE neighborhood_reviews (
    id UUID PRIMARY KEY,
    area_id UUID NOT NULL,
    user_id UUID,
    overall NUMERIC(2, 1) NOT NULL,
    safety NUMERIC(2, 1),
    transport NUMERIC(2, 1),
    amenities NUMERIC(2, 1),
    noise NUMERIC(2, 1),
    comment TEXT,
    lived_duration VARCHAR(255),
    status neighborhood_review_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT neighborhood_reviews_area_id_user_id_unique UNIQUE (area_id, user_id),
    CONSTRAINT neighborhood_reviews_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT,
    CONSTRAINT neighborhood_reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,

    CONSTRAINT neighborhood_reviews_overall_check CHECK (overall >= 1 AND overall <= 5)
);

-- =============================================================================
-- TABLE: mortgage_inquiries
-- =============================================================================

CREATE TABLE mortgage_inquiries (
    id UUID PRIMARY KEY,
    user_id UUID,
    property_id UUID,
    annual_income_kobo BIGINT,
    employment_type VARCHAR(255),
    desired_amount_kobo BIGINT,
    status VARCHAR(255),
    partner_bank VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT mortgage_inquiries_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT mortgage_inquiries_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE SET NULL
);

-- =============================================================================
-- TABLE: sessions
-- =============================================================================

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX sessions_user_id_index ON sessions (user_id);
CREATE INDEX sessions_last_activity_index ON sessions (last_activity);

-- =============================================================================
-- TABLE: personal_access_tokens
-- =============================================================================

CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id UUID NOT NULL,
    name TEXT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id);
CREATE INDEX personal_access_tokens_expires_at_index ON personal_access_tokens (expires_at);

-- =============================================================================
-- TABLE: scraped_listings
-- =============================================================================

CREATE TABLE scraped_listings (
    id UUID PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    source_url VARCHAR(1000) NOT NULL UNIQUE,
    source_id VARCHAR(200),
    raw_data JSONB NOT NULL,
    title VARCHAR(500) NOT NULL,
    price_kobo BIGINT,
    location VARCHAR(300),
    bedrooms SMALLINT,
    property_type VARCHAR(100),
    listing_type VARCHAR(10),
    image_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    matched_property_id UUID,
    dedup_score NUMERIC(5, 4),
    rejection_reason VARCHAR(500),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT scraped_listings_matched_property_id_foreign FOREIGN KEY (matched_property_id) REFERENCES properties (id) ON DELETE SET NULL
);

CREATE INDEX scraped_listings_source_index ON scraped_listings (source);
CREATE INDEX scraped_listings_status_index ON scraped_listings (status);
CREATE INDEX scraped_listings_source_source_id_index ON scraped_listings (source, source_id);

-- =============================================================================
-- TABLE: external_price_data
-- =============================================================================

CREATE TABLE external_price_data (
    id UUID PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    area_id UUID NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    bedrooms SMALLINT,
    price_kobo BIGINT NOT NULL,
    listing_type VARCHAR(10) NOT NULL DEFAULT 'rent',
    data_date DATE NOT NULL,
    raw_data JSONB,
    data_quality VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT external_price_data_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT
);

CREATE INDEX external_price_data_area_id_property_type_data_date_index ON external_price_data (area_id, property_type, data_date);
CREATE INDEX external_price_data_source_index ON external_price_data (source);

-- =============================================================================
-- TABLE: blog_posts
-- =============================================================================

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(255),
    category blog_category NOT NULL,
    tags JSONB,
    status blog_status NOT NULL DEFAULT 'draft',
    meta_title VARCHAR(255),
    meta_description VARCHAR(255),
    view_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT blog_posts_author_id_foreign FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX blog_posts_status_index ON blog_posts (status);
CREATE INDEX blog_posts_category_index ON blog_posts (category);
CREATE INDEX blog_posts_published_at_index ON blog_posts (published_at);
CREATE INDEX blog_posts_author_id_index ON blog_posts (author_id);

-- Full-text search GIN index
CREATE INDEX blog_posts_fulltext_idx ON blog_posts USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')));

-- =============================================================================
-- TABLE: property_requests
-- =============================================================================

CREATE TABLE property_requests (
    id UUID PRIMARY KEY,
    user_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    listing_type property_request_listing_type NOT NULL,
    property_type_id UUID,
    area_id UUID,
    city_id UUID,
    min_bedrooms SMALLINT,
    max_bedrooms SMALLINT,
    min_price_kobo BIGINT,
    max_price_kobo BIGINT,
    budget_kobo BIGINT,
    move_in_date DATE,
    amenity_preferences JSONB,
    status property_request_status NOT NULL DEFAULT 'active',
    response_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT property_requests_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT property_requests_property_type_id_foreign FOREIGN KEY (property_type_id) REFERENCES property_types (id) ON DELETE SET NULL,
    CONSTRAINT property_requests_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE SET NULL,
    CONSTRAINT property_requests_city_id_foreign FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE SET NULL
);

CREATE INDEX property_requests_status_index ON property_requests (status);
CREATE INDEX property_requests_listing_type_index ON property_requests (listing_type);
CREATE INDEX property_requests_city_id_index ON property_requests (city_id);
CREATE INDEX property_requests_area_id_index ON property_requests (area_id);
CREATE INDEX property_requests_user_id_index ON property_requests (user_id);
CREATE INDEX property_requests_expires_at_index ON property_requests (expires_at);

-- =============================================================================
-- TABLE: property_request_responses
-- =============================================================================

CREATE TABLE property_request_responses (
    id UUID PRIMARY KEY,
    property_request_id UUID NOT NULL,
    agent_id UUID,
    property_id UUID,
    message TEXT NOT NULL,
    proposed_price_kobo BIGINT,
    status property_request_response_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT property_request_responses_property_request_id_agent_id_unique UNIQUE (property_request_id, agent_id),
    CONSTRAINT property_request_responses_property_request_id_foreign FOREIGN KEY (property_request_id) REFERENCES property_requests (id) ON DELETE CASCADE,
    CONSTRAINT property_request_responses_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES agent_profiles (id) ON DELETE SET NULL,
    CONSTRAINT property_request_responses_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE SET NULL
);

CREATE INDEX property_request_responses_property_request_id_index ON property_request_responses (property_request_id);
CREATE INDEX property_request_responses_agent_id_index ON property_request_responses (agent_id);

-- =============================================================================
-- TABLE: estate_reviews
-- =============================================================================

CREATE TABLE estate_reviews (
    id UUID PRIMARY KEY,
    estate_id UUID NOT NULL,
    user_id UUID,
    rating SMALLINT NOT NULL,
    pros TEXT,
    cons TEXT,
    lived_from DATE,
    lived_to DATE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT estate_reviews_estate_id_user_id_unique UNIQUE (estate_id, user_id),
    CONSTRAINT estate_reviews_estate_id_foreign FOREIGN KEY (estate_id) REFERENCES estates (id) ON DELETE RESTRICT,
    CONSTRAINT estate_reviews_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- =============================================================================
-- TABLE: whatsapp_conversations
-- =============================================================================

CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY,
    phone VARCHAR(255) NOT NULL UNIQUE,
    session_state VARCHAR(255) NOT NULL DEFAULT 'idle',
    session_data JSONB,
    last_message_at TIMESTAMPTZ,
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT whatsapp_conversations_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX whatsapp_conversations_phone_index ON whatsapp_conversations (phone);

-- =============================================================================
-- TABLE: cooperatives
-- =============================================================================

CREATE TABLE cooperatives (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    admin_user_id UUID NOT NULL,
    target_amount_kobo BIGINT NOT NULL,
    property_id UUID,
    estate_id UUID,
    area_id UUID,
    status VARCHAR(255) NOT NULL DEFAULT 'forming',
    member_count INTEGER NOT NULL DEFAULT 0,
    monthly_contribution_kobo BIGINT,
    start_date DATE,
    target_date DATE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT cooperatives_admin_user_id_foreign FOREIGN KEY (admin_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT cooperatives_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE SET NULL,
    CONSTRAINT cooperatives_estate_id_foreign FOREIGN KEY (estate_id) REFERENCES estates (id) ON DELETE SET NULL,
    CONSTRAINT cooperatives_area_id_foreign FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE SET NULL
);

CREATE INDEX cooperatives_status_index ON cooperatives (status);
CREATE INDEX cooperatives_admin_user_id_index ON cooperatives (admin_user_id);

-- =============================================================================
-- TABLE: cooperative_members
-- =============================================================================

CREATE TABLE cooperative_members (
    id UUID PRIMARY KEY,
    cooperative_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'member',
    total_contributed_kobo BIGINT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT cooperative_members_cooperative_id_user_id_unique UNIQUE (cooperative_id, user_id),
    CONSTRAINT cooperative_members_cooperative_id_foreign FOREIGN KEY (cooperative_id) REFERENCES cooperatives (id) ON DELETE CASCADE,
    CONSTRAINT cooperative_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- =============================================================================
-- TABLE: cooperative_contributions
-- =============================================================================

CREATE TABLE cooperative_contributions (
    id UUID PRIMARY KEY,
    cooperative_id UUID NOT NULL,
    member_id UUID NOT NULL,
    amount_kobo BIGINT NOT NULL,
    payment_reference VARCHAR(255) UNIQUE,
    payment_method VARCHAR(255),
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    contributed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT cooperative_contributions_cooperative_id_foreign FOREIGN KEY (cooperative_id) REFERENCES cooperatives (id) ON DELETE CASCADE,
    CONSTRAINT cooperative_contributions_member_id_foreign FOREIGN KEY (member_id) REFERENCES cooperative_members (id) ON DELETE CASCADE
);

CREATE INDEX cooperative_contributions_cooperative_id_member_id_index ON cooperative_contributions (cooperative_id, member_id);
CREATE INDEX cooperative_contributions_payment_reference_index ON cooperative_contributions (payment_reference);

-- =============================================================================
-- TABLE: documents
-- =============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL,
    uploaded_by UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT documents_lead_id_foreign FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE RESTRICT,
    CONSTRAINT documents_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX documents_lead_id_type_index ON documents (lead_id, type);
CREATE INDEX documents_status_index ON documents (status);

-- =============================================================================
-- TABLE: commissions
-- =============================================================================

CREATE TABLE commissions (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL,
    property_id UUID NOT NULL,
    sale_price_kobo BIGINT NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 2.50,
    commission_amount_kobo BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT commissions_lead_id_foreign FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE RESTRICT,
    CONSTRAINT commissions_property_id_foreign FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE RESTRICT,
    CONSTRAINT commissions_created_by_foreign FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX commissions_status_index ON commissions (status);
CREATE INDEX commissions_created_at_index ON commissions (created_at);

-- =============================================================================
-- TABLE: processed_webhooks
-- =============================================================================

CREATE TABLE processed_webhooks (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(60),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT processed_webhooks_provider_event_id_unique UNIQUE (provider, event_id)
);

CREATE INDEX processed_webhooks_provider_index ON processed_webhooks (provider);

-- =============================================================================
-- TABLE: webauthn_credentials
-- =============================================================================

CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    aaguid VARCHAR(36),
    sign_count BIGINT NOT NULL DEFAULT 0,
    device_name VARCHAR(255) NOT NULL DEFAULT 'Passkey',
    transports VARCHAR(255),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    CONSTRAINT webauthn_credentials_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX webauthn_credentials_user_id_index ON webauthn_credentials (user_id);
