'use client';

import { useState } from 'react';
import { PRICE_RANGES, BEDROOM_OPTIONS } from '@/lib/constants';
import type { SearchFilters, ListingType } from '@/types';

interface Props {
  filters: SearchFilters;
  onFilterChange: (key: string, value: string | boolean | undefined) => void;
  onClearAll: () => void;
  className?: string;
}

const FURNISHING_OPTIONS = [
  { label: 'Furnished', value: 'furnished', icon: IconCouch },
  { label: 'Semi-Furnished', value: 'semi_furnished', icon: IconChair },
  { label: 'Unfurnished', value: 'unfurnished', icon: IconBox },
] as const;

const AMENITY_FILTERS = [
  { key: 'has_generator', label: 'Generator', icon: IconBolt },
  { key: 'has_water_supply', label: 'Water Supply', icon: IconDroplet },
  { key: 'is_serviced', label: 'Serviced', icon: IconShield },
  { key: 'has_bq', label: "Boy's Quarters (BQ)", icon: IconDoor },
  { key: 'is_new_build', label: 'New Build', icon: IconSparkle },
] as const;

const LISTING_TYPE_OPTIONS = [
  { label: 'Rent', value: 'rent', icon: IconKey },
  { label: 'Buy', value: 'sale', icon: IconHome },
  { label: 'Short Let', value: 'short_let', icon: IconCalendar },
] as const;

/* ------------------------------------------------------------------ */
/*  Micro SVG icons                                                    */
/* ------------------------------------------------------------------ */

function IconKey() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconCouch() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 10V7a2 2 0 00-2-2H6a2 2 0 00-2 2v3m16 0a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2m16 0H4m2 6v2m12-2v2" />
    </svg>
  );
}

function IconChair() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10V6a2 2 0 00-2-2H8a2 2 0 00-2 2v4m12 0H6m12 0v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m2 6v2m8-2v2" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconDroplet() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a8 8 0 008-8c0-4.418-8-12-8-12S4 8.582 4 13a8 8 0 008 8z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconDoor() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M15 12h.01" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

function IconBed() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h16a1 1 0 001-1V7M3 21v-4a1 1 0 011-1h16a1 1 0 011 1v4M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible filter section                                         */
/* ------------------------------------------------------------------ */

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <fieldset className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <legend className="sr-only">{title}</legend>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-1 group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-text-muted group-hover:text-accent-dark transition-colors">{icon}</span>}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-accent/15 text-accent-dark text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted motion-safe:transition-transform motion-safe:duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className="grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/*  Main filter panel                                                  */
/* ------------------------------------------------------------------ */

export default function SearchFiltersPanel({ filters, onFilterChange, onClearAll, className = '' }: Props) {
  const listingType = (filters.listing_type || 'rent') as ListingType;
  const priceRanges = PRICE_RANGES[listingType] || PRICE_RANGES.rent;

  // Count active filters for badges
  const priceActive = filters.min_price !== undefined || filters.max_price !== undefined ? 1 : 0;
  const bedroomActive = filters.min_bedrooms !== undefined ? 1 : 0;
  const furnishingActive = filters.furnishing ? 1 : 0;
  const amenityCount = AMENITY_FILTERS.filter(
    (a) => (filters as Record<string, unknown>)[a.key] === true || (filters as Record<string, unknown>)[a.key] === 'true'
  ).length;
  const totalActive = (filters.listing_type ? 1 : 0) + priceActive + bedroomActive + furnishingActive + amenityCount;

  return (
    <div className={`space-y-4 ${className}`} role="search" aria-label="Property filters">
      {/* Listing Type — pill-style segmented control */}
      <FilterSection title="Listing Type" defaultOpen>
        <div className="grid grid-cols-3 gap-1.5" role="group">
          {LISTING_TYPE_OPTIONS.map((opt) => {
            const active = filters.listing_type === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange('listing_type', active ? undefined : opt.value)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-accent/15 text-accent-dark ring-1 ring-accent-dark/30 shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
                aria-pressed={active}
              >
                <opt.icon />
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range — styled radio pills */}
      <FilterSection title="Price Range" count={priceActive}>
        <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Price range options">
          {priceRanges.map((range) => {
            const isActive = filters.min_price === range.min && filters.max_price === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    onFilterChange('min_price', undefined);
                    onFilterChange('max_price', undefined);
                  } else {
                    onFilterChange('min_price', String(range.min));
                    onFilterChange('max_price', range.max !== undefined ? String(range.max) : undefined);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-accent/15 border-accent-dark/30 text-accent-dark shadow-sm'
                    : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                }`}
                role="option"
                aria-selected={isActive}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Bedrooms — numbered chips with bed icon */}
      <FilterSection
        title="Bedrooms"
        icon={<IconBed />}
        count={bedroomActive}
      >
        <div className="grid grid-cols-6 gap-1.5" role="group">
          {BEDROOM_OPTIONS.map((opt) => {
            const active = filters.min_bedrooms === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange('min_bedrooms', active ? undefined : String(opt.value))}
                className={`relative flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-accent/15 text-accent-dark ring-1 ring-accent-dark/30 shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
                aria-pressed={active}
              >
                <span className="text-sm font-semibold">{opt.label === 'Studio' ? '—' : opt.value}</span>
                <span className="text-[10px] text-text-muted">{opt.label === 'Studio' ? 'Studio' : `Bed${opt.value > 1 ? 's' : ''}`}</span>
                {opt.value >= 5 && <span className="absolute -top-0.5 -right-0.5 text-[8px] text-accent-dark font-bold">+</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Furnishing — card-style options */}
      <FilterSection title="Furnishing" count={furnishingActive}>
        <div className="grid grid-cols-3 gap-1.5">
          {FURNISHING_OPTIONS.map((opt) => {
            const active = filters.furnishing === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onFilterChange('furnishing', active ? undefined : opt.value)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-accent/15 text-accent-dark ring-1 ring-accent-dark/30 shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
                aria-pressed={active}
              >
                <opt.icon />
                <span className="leading-tight text-center">{opt.label.replace('-', '\u2011')}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Features / Amenities — toggle switches */}
      <FilterSection title="Features" count={amenityCount} defaultOpen={amenityCount > 0}>
        <div className="space-y-1">
          {AMENITY_FILTERS.map((amenity) => {
            const isChecked =
              (filters as Record<string, unknown>)[amenity.key] === true ||
              (filters as Record<string, unknown>)[amenity.key] === 'true';
            return (
              <button
                key={amenity.key}
                type="button"
                onClick={() => onFilterChange(amenity.key, isChecked ? undefined : true)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isChecked
                    ? 'bg-accent/10 text-accent-dark'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
                role="switch"
                aria-checked={isChecked}
              >
                <span className={`flex-shrink-0 transition-colors ${isChecked ? 'text-accent-dark' : 'text-text-muted'}`}>
                  <amenity.icon />
                </span>
                <span className="flex-1 text-left font-medium">{amenity.label}</span>
                {/* Toggle track */}
                <span
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    isChecked ? 'bg-accent-dark' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isChecked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Clear All */}
      {totalActive > 0 && (
        <button
          onClick={onClearAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-error/80 hover:text-error font-medium transition-colors rounded-xl hover:bg-error/5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
          <span className="bg-error/10 text-error text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalActive}
          </span>
        </button>
      )}
    </div>
  );
}
