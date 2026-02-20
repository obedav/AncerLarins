'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import SearchFiltersPanel from '@/components/search/SearchFiltersPanel';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import SaveSearchButton from '@/components/search/SaveSearchButton';
import { useSearchPropertiesQuery, useGetMapPropertiesQuery } from '@/store/api/searchApi';
import { SORT_OPTIONS } from '@/lib/constants';
import type { SearchFilters, MapBounds } from '@/types';

const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), { ssr: false });

type ViewMode = 'grid' | 'list' | 'map';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  const filters: SearchFilters = useMemo(() => ({
    q: searchParams.get('q') || undefined,
    listing_type: (searchParams.get('listing_type') as SearchFilters['listing_type']) || undefined,
    property_type_id: searchParams.get('property_type_id') || undefined,
    city_id: searchParams.get('city_id') || undefined,
    area_id: searchParams.get('area_id') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_bedrooms: searchParams.get('min_bedrooms') ? Number(searchParams.get('min_bedrooms')) : undefined,
    furnishing: (searchParams.get('furnishing') as SearchFilters['furnishing']) || undefined,
    is_serviced: searchParams.get('is_serviced') === 'true' ? true : undefined,
    has_bq: searchParams.get('has_bq') === 'true' ? true : undefined,
    sort_by: (searchParams.get('sort_by') as SearchFilters['sort_by']) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    per_page: 20,
  }), [searchParams]);

  const { data, isLoading, isFetching } = useSearchPropertiesQuery(filters);
  const properties = data?.data || [];
  const meta = data?.meta;

  // Map view data — only fetch when map is visible and we have bounds
  const { data: mapData } = useGetMapPropertiesQuery(
    { ...mapBounds!, listing_type: filters.listing_type } as MapBounds & Record<string, unknown>,
    { skip: viewMode !== 'map' || !mapBounds },
  );
  const mapProperties = mapData?.data || [];

  const updateFilter = useCallback((key: string, value: string | boolean | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  }, [searchParams, router]);

  const clearAll = useCallback(() => {
    router.push('/properties');
  }, [router]);

  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/properties?${params.toString()}`);
  }, [searchParams, router]);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.q) chips.push({ key: 'q', label: `"${filters.q}"` });
    if (filters.listing_type) chips.push({ key: 'listing_type', label: filters.listing_type === 'rent' ? 'For Rent' : 'For Sale' });
    if (filters.min_bedrooms !== undefined) chips.push({ key: 'min_bedrooms', label: `${filters.min_bedrooms}+ Beds` });
    if (filters.min_price || filters.max_price) chips.push({ key: 'price', label: 'Price filtered' });
    if (filters.furnishing) chips.push({ key: 'furnishing', label: filters.furnishing.replace('_', ' ') });
    if (filters.is_serviced) chips.push({ key: 'is_serviced', label: 'Serviced' });
    if (filters.has_bq) chips.push({ key: 'has_bq', label: 'BQ' });
    return chips;
  }, [filters]);

  const removeChip = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'price') {
      params.delete('min_price');
      params.delete('max_price');
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  }, [searchParams, router]);

  // Result count label
  const resultLabel = useMemo(() => {
    if (!meta) return '';
    const parts: string[] = [];
    parts.push(`${meta.total.toLocaleString()} propert${meta.total === 1 ? 'y' : 'ies'}`);
    if (filters.listing_type === 'rent') parts.push('for rent');
    if (filters.listing_type === 'sale') parts.push('for sale');
    return parts.join(' ');
  }, [meta, filters.listing_type]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="bg-primary py-6">
          <div className="container-app">
            <div className="max-w-xl">
              <SearchAutocomplete placeholder="Search areas, property types..." />
            </div>
          </div>
        </div>

        <div className="container-app py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 bg-surface rounded-xl border border-border overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="h-0.5 bg-accent" />
                <div className="p-5">
                <h2 className="text-base font-bold text-text-primary mb-4">Filters</h2>
                <SearchFiltersPanel
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClearAll={clearAll}
                />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  {resultLabel && (
                    <p className="text-sm font-medium text-text-primary">{resultLabel}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className={`lg:hidden relative flex items-center gap-1.5 border rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                      activeFilters.length > 0
                        ? 'bg-accent/10 border-accent-dark/30 text-accent-dark'
                        : 'bg-surface border-border text-text-secondary hover:border-text-muted'
                    }`}
                    aria-label="Open filters"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="bg-accent-dark text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center -mr-1">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  {/* View toggles */}
                  <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-2.5 py-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
                      aria-label="Grid view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
                      aria-label="List view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-2.5 py-2 transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
                      aria-label="Map view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={filters.sort_by || 'newest'}
                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent-dark"
                    aria-label="Sort properties"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <SaveSearchButton filters={filters} />
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeFilters.map((chip) => (
                    <span key={chip.key} className="bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-sm flex items-center gap-1.5 capitalize">
                      {chip.label}
                      <button onClick={() => removeChip(chip.key)} className="hover:text-error font-bold" aria-label={`Remove ${chip.label} filter`}>&times;</button>
                    </span>
                  ))}
                  {activeFilters.length > 1 && (
                    <button onClick={clearAll} className="text-xs text-text-muted hover:text-error px-2 py-1">
                      Clear all
                    </button>
                  )}
                </div>
              )}

              {/* Results */}
              {viewMode === 'map' ? (
                /* Map View */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '600px' }}>
                  <div className="order-2 lg:order-1 space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} source="map" />
                    ))}
                    {properties.length === 0 && !isLoading && (
                      <p className="text-center text-text-muted py-10">No properties in this area</p>
                    )}
                  </div>
                  <div className="order-1 lg:order-2 h-[400px] lg:h-auto lg:sticky lg:top-20 rounded-xl overflow-hidden">
                    <PropertyMap
                      properties={mapProperties}
                      onBoundsChange={setMapBounds}
                    />
                  </div>
                </div>
              ) : isLoading ? (
                /* Loading skeleton */
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface rounded-xl border border-border animate-pulse">
                      <div className={`bg-border/50 ${viewMode === 'list' ? 'h-32' : 'h-48'} rounded-t-xl`} />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-border/50 rounded w-1/2" />
                        <div className="h-4 bg-border/50 rounded w-3/4" />
                        <div className="h-4 bg-border/50 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No properties found</h3>
                  <p className="text-text-muted mb-4">Try adjusting your filters or search terms</p>
                  <button onClick={clearAll} className="text-accent-dark font-medium hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`${isFetching ? 'opacity-60' : ''} grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} source="search" />
                    ))}
                  </div>

                  {/* Pagination */}
                  {meta && meta.last_page > 1 && (
                    <nav className="flex justify-center items-center gap-1.5 mt-10" aria-label="Pagination">
                      <button
                        onClick={() => setPage(meta.current_page - 1)}
                        disabled={meta.current_page === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-sm disabled:opacity-30 hover:bg-surface transition-colors"
                        aria-label="Previous page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      {(() => {
                        const pages: (number | 'ellipsis')[] = [];
                        const current = meta.current_page;
                        const last = meta.last_page;
                        pages.push(1);
                        if (current > 3) pages.push('ellipsis');
                        for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
                          pages.push(p);
                        }
                        if (current < last - 2) pages.push('ellipsis');
                        if (last > 1) pages.push(last);
                        return pages.map((p, i) =>
                          p === 'ellipsis' ? (
                            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">...</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                p === current
                                  ? 'bg-primary text-white'
                                  : 'border border-border hover:bg-surface text-text-secondary'
                              }`}
                              aria-label={`Page ${p}`}
                              aria-current={p === current ? 'page' : undefined}
                            >
                              {p}
                            </button>
                          )
                        );
                      })()}
                      <button
                        onClick={() => setPage(meta.current_page + 1)}
                        disabled={meta.current_page === meta.last_page}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-sm disabled:opacity-30 hover:bg-surface transition-colors"
                        aria-label="Next page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Sheet — always mounted, animates in/out */}
      <div
        className={`lg:hidden fixed inset-0 z-50 motion-safe:transition-opacity motion-safe:duration-300 ${
          mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal={mobileFiltersOpen}
        aria-label="Filters"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileFiltersOpen(false)}
          aria-hidden="true"
        />

        {/* Sheet panel */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden motion-safe:transition-transform motion-safe:duration-300 ease-out ${
            mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Accent bar */}
          <div className="h-0.5 bg-accent" />

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Filters</h2>
              {activeFilters.length > 0 && (
                <span className="bg-accent/15 text-accent-dark text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-background transition-colors"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <SearchFiltersPanel
              filters={filters}
              onFilterChange={(key, value) => { updateFilter(key, value); }}
              onClearAll={() => { clearAll(); setMobileFiltersOpen(false); }}
            />
          </div>

          {/* Sticky CTA footer */}
          <div className="border-t border-border px-5 py-4 bg-surface">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-accent text-primary py-3.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors shadow-sm"
            >
              Show {meta?.total.toLocaleString() || ''} Results
            </button>
          </div>
        </div>
      </div>

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
