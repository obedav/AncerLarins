'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import AreaStats from '@/components/area/AreaStats';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { formatPriceShort } from '@/lib/utils';

interface AreaData {
  id: string;
  name: string;
  slug: string;
  avg_rent_1br: number | null;
  avg_rent_2br: number | null;
  avg_rent_3br: number | null;
  avg_buy_price_sqm: number | null;
  safety_score: number | null;
  landmarks?: { id: string; name: string; type: string }[];
}

interface AreaGuideContentProps {
  area: AreaData;
  listingType: 'rent' | 'sale';
}

export default function AreaGuideContent({ area, listingType }: AreaGuideContentProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPropertiesQuery({
    area_id: area.id,
    listing_type: listingType,
    page,
    per_page: 12,
  });

  const properties = data?.data || [];
  const meta = data?.meta;

  const typeName = listingType === 'sale' ? 'Sale' : 'Rent';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary py-10 md:py-14">
          <div className="container-app">
            <nav className="flex items-center gap-1.5 text-sm text-white/40 mb-4">
              <Link href="/" className="hover:text-white/60">Home</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <Link href="/properties" className="hover:text-white/60">Properties</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white/70">For {typeName}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white/70">{area.name}</span>
            </nav>

            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Properties for {typeName} in {area.name}, Lagos
            </h1>
            <p className="text-white/60 max-w-2xl">
              {listingType === 'rent'
                ? `Browse verified rental properties in ${area.name}. Average rent ranges from ${area.avg_rent_1br ? formatPriceShort(area.avg_rent_1br) : 'N/A'} (1 bed) to ${area.avg_rent_3br ? formatPriceShort(area.avg_rent_3br) : 'N/A'} (3 bed) per year.`
                : `Find properties for sale in ${area.name}. Average price per sqm: ${area.avg_buy_price_sqm ? formatPriceShort(area.avg_buy_price_sqm) : 'N/A'}.`
              }
            </p>
          </div>
        </div>

        <div className="container-app py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-6 order-2 lg:order-1">
              <AreaStats area={area} listingType={listingType} />

              {/* Nearby Landmarks */}
              {area.landmarks && area.landmarks.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Nearby Landmarks</h3>
                  <div className="space-y-2">
                    {area.landmarks.map((lm) => (
                      <div key={lm.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-accent-dark flex-shrink-0" />
                        <span className="text-text-secondary truncate">{lm.name}</span>
                        <span className="text-xs text-text-muted capitalize ml-auto">{lm.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Switch listing type */}
              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Also in {area.name}</h3>
                <Link
                  href={`/properties/${listingType === 'rent' ? 'sale' : 'rent'}/${area.slug}`}
                  className="flex items-center justify-between py-2 px-3 bg-background rounded-lg text-sm text-primary font-medium hover:bg-accent/5 transition-colors"
                >
                  <span>Properties for {listingType === 'rent' ? 'Sale' : 'Rent'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface rounded-xl border border-border animate-pulse">
                      <div className="h-48 bg-border/50 rounded-t-xl" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-border/50 rounded w-3/4" />
                        <div className="h-4 bg-border/50 rounded w-1/2" />
                        <div className="h-4 bg-border/50 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                  <p className="text-text-muted text-lg mb-4">
                    No properties for {listingType === 'sale' ? 'sale' : 'rent'} in {area.name} right now.
                  </p>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-light transition-colors"
                  >
                    Browse All Properties
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-text-muted">
                      {meta?.total || properties.length} propert{(meta?.total || properties.length) === 1 ? 'y' : 'ies'} found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} source="area_guide" />
                    ))}
                  </div>

                  {/* Pagination */}
                  {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between mt-8">
                      <p className="text-sm text-text-muted">
                        Page {meta.current_page} of {meta.last_page}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= (meta.last_page || 1)}
                          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
