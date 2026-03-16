'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetSavedSearchesQuery, useDeleteSavedSearchMutation } from '@/store/api/userApi';
import { formatPrice } from '@/lib/utils';

function SavedSearchSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-border/50 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 bg-border/50 rounded w-44" />
            <div className="h-5 bg-border/50 rounded-full w-16" />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <div className="h-6 bg-border/50 rounded-lg w-20" />
            <div className="h-6 bg-border/50 rounded-lg w-24" />
            <div className="h-6 bg-border/50 rounded-lg w-28" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 bg-border/50 rounded w-24" />
            <div className="h-3 bg-border/50 rounded w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-9 bg-border/50 rounded-lg w-28" />
          <div className="h-9 w-9 bg-border/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FilterChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-background text-text-secondary text-xs px-2.5 py-1 rounded-lg">
      <span className="text-text-muted">{icon}</span>
      {children}
    </span>
  );
}

/* Tiny inline SVG icons for filter chips */
const ChipIcons = {
  house: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  tag: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  pin: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  banknote: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  bed: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0H9m3 0h3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
};

export default function SavedSearchesPage() {
  const { data, isLoading } = useGetSavedSearchesQuery();
  const searches = data?.data ?? [];

  const [deleteSearch] = useDeleteSavedSearchMutation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const buildSearchUrl = (search: typeof searches[number]) => {
    const params = new URLSearchParams();
    if (search.listing_type) params.set('listing_type', search.listing_type);
    if (search.property_type_id) params.set('property_type_id', search.property_type_id);
    if (search.city_id) params.set('city_id', search.city_id);
    if (search.area_ids?.length) params.set('area_id', search.area_ids[0]);
    if (search.min_price_kobo) params.set('min_price', String(search.min_price_kobo));
    if (search.max_price_kobo) params.set('max_price', String(search.max_price_kobo));
    if (search.min_bedrooms) params.set('min_bedrooms', String(search.min_bedrooms));
    if (search.furnishing) params.set('furnishing', search.furnishing);
    return `/properties?${params.toString()}`;
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteSearch(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-border/50 animate-pulse" />
            <div>
              <div className="h-6 bg-border/50 rounded w-40 animate-pulse mb-1.5" />
              <div className="h-3.5 bg-border/50 rounded w-52 animate-pulse" />
            </div>
          </div>
          <div className="h-9 bg-border/50 rounded-lg w-36 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <SavedSearchSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Saved Searches</h1>
            <p className="text-sm text-text-muted">
              {searches.length > 0
                ? `${searches.length} saved search${searches.length !== 1 ? 'es' : ''}`
                : 'Get notified when new properties match your criteria'}
            </p>
          </div>
        </div>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-accent-dark font-medium bg-accent/10 hover:bg-accent/20 px-3.5 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Browse Properties
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-border/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No saved searches yet</h3>
          <p className="text-sm text-text-muted max-w-xs mx-auto mb-5">
            Save your property search criteria and get notified when new listings match.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            Search Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="bg-surface rounded-xl border border-border p-5 hover:border-accent-dark/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Search icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-text-primary">{search.name}</h3>
                    {search.match_count > 0 && (
                      <span className="animate-pulse bg-accent/15 text-accent-dark text-xs font-bold px-2 py-0.5 rounded-full">
                        {search.match_count} new
                      </span>
                    )}
                  </div>

                  {/* Filter chips with icons */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {search.listing_type && (
                      <FilterChip icon={ChipIcons.house}>
                        <span className="capitalize">{search.listing_type}</span>
                      </FilterChip>
                    )}
                    {search.property_type?.name && (
                      <FilterChip icon={ChipIcons.tag}>
                        {search.property_type.name}
                      </FilterChip>
                    )}
                    {search.city?.name && (
                      <FilterChip icon={ChipIcons.pin}>
                        {search.city.name}
                      </FilterChip>
                    )}
                    {search.min_price_kobo && (
                      <FilterChip icon={ChipIcons.banknote}>
                        From {formatPrice(search.min_price_kobo)}
                      </FilterChip>
                    )}
                    {search.max_price_kobo && (
                      <FilterChip icon={ChipIcons.banknote}>
                        Up to {formatPrice(search.max_price_kobo)}
                      </FilterChip>
                    )}
                    {search.min_bedrooms && (
                      <FilterChip icon={ChipIcons.bed}>
                        {search.min_bedrooms}+ beds
                      </FilterChip>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="capitalize">Alerts: {search.frequency}</span>
                    <span>
                      Created {new Date(search.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={buildSearchUrl(search)}
                    className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    View Results
                  </Link>
                  <button
                    onClick={() => handleDelete(search.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      confirmDeleteId === search.id
                        ? 'bg-error/10 text-error'
                        : 'text-text-muted hover:text-error hover:bg-background'
                    }`}
                    aria-label={confirmDeleteId === search.id ? 'Click again to confirm delete' : 'Delete saved search'}
                    title={confirmDeleteId === search.id ? 'Click again to confirm' : 'Delete'}
                  >
                    {confirmDeleteId === search.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
