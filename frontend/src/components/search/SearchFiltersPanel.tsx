'use client';

import { PRICE_RANGES, BEDROOM_OPTIONS } from '@/lib/constants';
import type { SearchFilters, ListingType } from '@/types';

interface Props {
  filters: SearchFilters;
  onFilterChange: (key: string, value: string | boolean | undefined) => void;
  onClearAll: () => void;
  className?: string;
}

const FURNISHING_OPTIONS = [
  { label: 'Furnished', value: 'furnished' },
  { label: 'Semi-Furnished', value: 'semi_furnished' },
  { label: 'Unfurnished', value: 'unfurnished' },
] as const;

const AMENITY_FILTERS = [
  { key: 'has_generator', label: 'Generator' },
  { key: 'has_water_supply', label: 'Water Supply' },
  { key: 'is_serviced', label: 'Serviced' },
  { key: 'has_bq', label: "Boy's Quarters (BQ)" },
  { key: 'is_new_build', label: 'New Build' },
] as const;

export default function SearchFiltersPanel({ filters, onFilterChange, onClearAll, className = '' }: Props) {
  const listingType = (filters.listing_type || 'rent') as ListingType;
  const priceRanges = PRICE_RANGES[listingType] || PRICE_RANGES.rent;

  return (
    <div className={`space-y-6 ${className}`} role="search" aria-label="Property filters">
      {/* Listing Type */}
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary mb-2">Listing Type</legend>
        <div className="flex bg-background border border-border rounded-lg overflow-hidden" role="group">
          <button
            onClick={() => onFilterChange('listing_type', filters.listing_type === 'rent' ? undefined : 'rent')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${filters.listing_type === 'rent' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            aria-pressed={filters.listing_type === 'rent'}
          >
            Rent
          </button>
          <button
            onClick={() => onFilterChange('listing_type', filters.listing_type === 'sale' ? undefined : 'sale')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${filters.listing_type === 'sale' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            aria-pressed={filters.listing_type === 'sale'}
          >
            Buy
          </button>
          <button
            onClick={() => onFilterChange('listing_type', filters.listing_type === 'short_let' ? undefined : 'short_let')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${filters.listing_type === 'short_let' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
            aria-pressed={filters.listing_type === 'short_let'}
          >
            Short Let
          </button>
        </div>
      </fieldset>

      {/* Price Range */}
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary mb-2">Price Range</legend>
        <div className="space-y-1" role="listbox" aria-label="Price range options">
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
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-accent/10 text-accent-dark font-medium' : 'text-text-secondary hover:bg-background'
                }`}
                role="option"
                aria-selected={isActive}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Bedrooms */}
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary mb-2">Bedrooms</legend>
        <div className="flex flex-wrap gap-2" role="group">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange('min_bedrooms', filters.min_bedrooms === opt.value ? undefined : String(opt.value))}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filters.min_bedrooms === opt.value
                  ? 'border-accent-dark bg-accent/10 text-accent-dark font-medium'
                  : 'border-border text-text-secondary hover:border-text-muted'
              }`}
              aria-pressed={filters.min_bedrooms === opt.value}
            >
              {opt.label}{opt.value > 0 ? '+' : ''}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Furnishing */}
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary mb-2">Furnishing</legend>
        <div className="space-y-1">
          {FURNISHING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange('furnishing', filters.furnishing === opt.value ? undefined : opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.furnishing === opt.value ? 'bg-accent/10 text-accent-dark font-medium' : 'text-text-secondary hover:bg-background'
              }`}
              aria-pressed={filters.furnishing === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Amenities/Features */}
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary mb-2">Features</legend>
        <div className="space-y-2">
          {AMENITY_FILTERS.map((amenity) => {
            const isChecked = (filters as Record<string, unknown>)[amenity.key] === true ||
                              (filters as Record<string, unknown>)[amenity.key] === 'true';
            return (
              <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => onFilterChange(amenity.key, isChecked ? undefined : true)}
                  className="rounded border-border text-accent-dark focus:ring-accent-dark"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {amenity.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Clear All */}
      <button
        onClick={onClearAll}
        className="w-full py-2.5 text-sm text-error hover:text-error/80 font-medium transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
