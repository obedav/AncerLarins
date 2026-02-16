'use client';

import Link from 'next/link';
import { useGetSavedSearchesQuery, useDeleteSavedSearchMutation } from '@/store/api/userApi';
import { formatPrice } from '@/lib/utils';

export default function SavedSearchesPage() {
  const { data, isLoading } = useGetSavedSearchesQuery();
  const searches = data?.data ?? [];

  const [deleteSearch] = useDeleteSavedSearchMutation();

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-border/50 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-border/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Saved Searches</h1>
        <Link
          href="/properties"
          className="text-sm text-accent-dark font-medium hover:underline"
        >
          Browse properties
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          <p className="text-text-muted mb-4">No saved searches yet</p>
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
              className="bg-surface rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-text-primary">{search.name}</h3>
                    {search.match_count > 0 && (
                      <span className="bg-accent/15 text-accent-dark text-xs font-bold px-2 py-0.5 rounded-full">
                        {search.match_count} new
                      </span>
                    )}
                  </div>

                  {/* Filter tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {search.listing_type && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded capitalize">
                        {search.listing_type}
                      </span>
                    )}
                    {search.property_type?.name && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded">
                        {search.property_type.name}
                      </span>
                    )}
                    {search.city?.name && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded">
                        {search.city.name}
                      </span>
                    )}
                    {search.min_price_kobo && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded">
                        From {formatPrice(search.min_price_kobo)}
                      </span>
                    )}
                    {search.max_price_kobo && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded">
                        Up to {formatPrice(search.max_price_kobo)}
                      </span>
                    )}
                    {search.min_bedrooms && (
                      <span className="bg-background text-text-secondary text-xs px-2 py-1 rounded">
                        {search.min_bedrooms}+ beds
                      </span>
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
                    onClick={() => {
                      if (confirm('Delete this saved search?')) {
                        deleteSearch(search.id);
                      }
                    }}
                    className="text-text-muted hover:text-error p-2 rounded-lg hover:bg-background transition-colors"
                    aria-label="Delete saved search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
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
