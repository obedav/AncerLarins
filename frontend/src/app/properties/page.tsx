'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import { useSearchPropertiesQuery } from '@/store/api/searchApi';
import { SORT_OPTIONS, BEDROOM_OPTIONS } from '@/lib/constants';
import type { SearchFilters } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters: SearchFilters = useMemo(() => ({
    q: searchParams.get('q') || undefined,
    listing_type: (searchParams.get('listing_type') as SearchFilters['listing_type']) || undefined,
    property_type_id: searchParams.get('property_type_id') || undefined,
    city_id: searchParams.get('city_id') || undefined,
    area_id: searchParams.get('area_id') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_bedrooms: searchParams.get('min_bedrooms') ? Number(searchParams.get('min_bedrooms')) : undefined,
    sort_by: (searchParams.get('sort_by') as SearchFilters['sort_by']) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    per_page: 20,
  }), [searchParams]);

  const { data, isLoading, isFetching } = useSearchPropertiesQuery(filters);
  const properties = data?.data || [];
  const meta = data?.meta;

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="bg-primary py-8">
          <div className="container-app">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {filters.listing_type === 'rent' ? 'Properties for Rent' :
               filters.listing_type === 'sale' ? 'Properties for Sale' :
               'All Properties'}
            </h1>
            {meta && (
              <p className="text-white/60 mt-1">{meta.total.toLocaleString()} properties found</p>
            )}
          </div>
        </div>

        <div className="container-app py-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Listing Type Toggle */}
            <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => updateFilter('listing_type', filters.listing_type === 'rent' ? undefined : 'rent')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filters.listing_type === 'rent' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}
              >
                Rent
              </button>
              <button
                onClick={() => updateFilter('listing_type', filters.listing_type === 'sale' ? undefined : 'sale')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filters.listing_type === 'sale' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}
              >
                Buy
              </button>
            </div>

            {/* Bedrooms */}
            <select
              value={filters.min_bedrooms || ''}
              onChange={(e) => updateFilter('min_bedrooms', e.target.value || undefined)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent-dark"
            >
              <option value="">Bedrooms</option>
              {BEDROOM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}+ Bed</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort_by || 'newest'}
              onChange={(e) => updateFilter('sort_by', e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent-dark ml-auto"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary"
            >
              Filters
            </button>
          </div>

          {/* Active Filters */}
          {(filters.q || filters.min_price || filters.max_price) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.q && (
                <span className="bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  &quot;{filters.q}&quot;
                  <button onClick={() => updateFilter('q', undefined)} className="hover:text-error">&times;</button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-xl border border-border animate-pulse">
                  <div className="h-48 bg-border/50 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-border/50 rounded w-1/2" />
                    <div className="h-4 bg-border/50 rounded w-3/4" />
                    <div className="h-4 bg-border/50 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No properties found</h3>
              <p className="text-text-muted">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isFetching ? 'opacity-60' : ''}`}>
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 hover:bg-surface transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-muted px-4">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <button
                    onClick={() => setPage(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 hover:bg-surface transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
