'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import ContactAgent from '@/components/property/ContactAgent';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import NeighborhoodInsights from '@/components/property/NeighborhoodInsights';
import MarketTrends from '@/components/property/MarketTrends';
import { useGetPropertyBySlugQuery, useGetSimilarPropertiesQuery } from '@/store/api/propertyApi';
import { formatPrice, formatPriceShort, setLeadSource } from '@/lib/utils';

export default function PropertyDetailContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useGetPropertyBySlugQuery(slug);
  const property = data?.data;

  const { data: similarData } = useGetSimilarPropertiesQuery(property?.id || '', {
    skip: !property?.id,
  });
  const similar = similarData?.data || [];

  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const goToImage = useCallback((dir: 1 | -1) => {
    if (!property) return;
    const imgs = property.images || [];
    if (imgs.length <= 1) return;
    setActiveImage((prev) => (prev + dir + imgs.length) % imgs.length);
  }, [property]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDeltaX.current) > 50) {
      goToImage(touchDeltaX.current > 0 ? -1 : 1);
    }
  }, [goToImage]);

  // Capture referral source for lead attribution
  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('utm_source');
    if (ref) {
      setLeadSource(ref);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container-app py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-border/50 rounded-xl" />
            <div className="h-8 bg-border/50 rounded w-1/3" />
            <div className="h-6 bg-border/50 rounded w-1/4" />
            <div className="h-40 bg-border/50 rounded" />
          </div>
        </div>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />
        <div className="container-app py-20 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Property Not Found</h1>
          <p className="text-text-muted mb-6">The property you are looking for does not exist or has been removed.</p>
          <Link href="/properties" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors">
            Browse Properties
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const images = property.images || [];

  const features = [
    property.has_bq && 'BQ',
    property.has_swimming_pool && 'Swimming Pool',
    property.has_gym && 'Gym',
    property.has_cctv && 'CCTV',
    property.has_generator && 'Generator',
    property.has_water_supply && 'Water Supply',
    property.has_prepaid_meter && 'Prepaid Meter',
    property.is_serviced && 'Serviced',
    property.is_new_build && 'New Build',
    property.parking_spaces && `${property.parking_spaces} Parking`,
  ].filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 lg:pb-0">
        <div className="container-app py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-4 overflow-x-auto">
            <Link href="/" className="hover:text-primary whitespace-nowrap">Home</Link>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/properties" className="hover:text-primary whitespace-nowrap">Properties</Link>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-text-primary truncate">{property.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="rounded-xl overflow-hidden bg-surface border border-border">
                <div
                  className="relative h-64 sm:h-80 md:h-96 select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {images.length > 0 ? (
                    <Image
                      src={images[activeImage]?.url || ''}
                      alt={images[activeImage]?.caption || property.title}
                      fill
                      className="object-cover"
                      priority
                      draggable={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-border/30 text-text-muted">No Images</div>
                  )}
                  {images.length > 1 && (
                    <>
                      {/* Prev/Next Arrows */}
                      <button
                        onClick={() => goToImage(-1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => goToImage(1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      {/* Dot Indicators (mobile) + Counter (desktop) */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/50'}`}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-primary/80 text-white text-sm px-3 py-1 rounded-full hidden sm:block">
                        {activeImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="hidden sm:flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(i)}
                        className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-accent-dark' : 'border-transparent'}`}
                      >
                        <Image src={img.thumbnail_url || img.url} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-surface rounded-xl border border-border p-6">
                {/* Listing + Property Type Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                    {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'short_let' ? 'Short Let' : 'For Rent'}
                  </span>
                  {property.property_type && (
                    <span className="bg-accent/10 text-accent-dark text-xs px-3 py-1 rounded-full font-medium">
                      {property.property_type.name}
                    </span>
                  )}
                  {property.is_new && (
                    <span className="bg-success/10 text-success text-xs px-3 py-1 rounded-full font-medium">New Listing</span>
                  )}
                  {property.published_at && (
                    <span className="text-xs text-text-muted ml-auto">
                      Listed {new Date(property.published_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{property.title}</h1>
                    <p className="text-text-muted mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.area?.name ? `${property.area.name}, ` : ''}{property.city?.name}{property.state ? `, ${property.state.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {formatPrice(property.price_kobo)}
                    </p>
                    {property.rent_period && (
                      <p className="text-text-muted text-sm">per {property.rent_period}</p>
                    )}
                    {property.price_negotiable && (
                      <span className="inline-flex items-center gap-1 text-accent-dark text-xs font-medium bg-accent/10 px-2 py-0.5 rounded-full mt-1">Negotiable</span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-4 border-y border-border">
                  {property.bedrooms !== null && (
                    <div className="bg-background rounded-xl py-3 px-2 text-center">
                      <p className="text-xl font-bold text-text-primary">{property.bedrooms}</p>
                      <p className="text-xs text-text-muted mt-0.5">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms !== null && (
                    <div className="bg-background rounded-xl py-3 px-2 text-center">
                      <p className="text-xl font-bold text-text-primary">{property.bathrooms}</p>
                      <p className="text-xs text-text-muted mt-0.5">Bathrooms</p>
                    </div>
                  )}
                  {property.toilets !== null && (
                    <div className="bg-background rounded-xl py-3 px-2 text-center">
                      <p className="text-xl font-bold text-text-primary">{property.toilets}</p>
                      <p className="text-xs text-text-muted mt-0.5">Toilets</p>
                    </div>
                  )}
                  {property.floor_area_sqm && (
                    <div className="bg-background rounded-xl py-3 px-2 text-center">
                      <p className="text-xl font-bold text-text-primary">{property.floor_area_sqm}</p>
                      <p className="text-xs text-text-muted mt-0.5">sqm</p>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="bg-background rounded-xl py-3 px-2 text-center">
                      <p className="text-sm font-semibold text-text-primary capitalize">{property.furnishing.replace('_', ' ')}</p>
                      <p className="text-xs text-text-muted mt-0.5">Furnishing</p>
                    </div>
                  )}
                </div>

                {/* AncerEstimate */}
                {property.ancer_estimate && (
                  <div className="mt-6 bg-primary/5 border border-primary/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">AncerEstimate</span>
                      <span className="text-xs text-text-muted">Automated valuation</span>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-1">
                      {property.ancer_estimate.formatted_estimate}
                    </p>
                    <p className="text-xs text-text-muted mb-3">
                      Range: {formatPriceShort(property.ancer_estimate.price_range.low_kobo)} &ndash; {formatPriceShort(property.ancer_estimate.price_range.high_kobo)}
                    </p>
                    {/* Confidence bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Confidence</span>
                      <div className="flex-1 bg-border/50 rounded-full h-1.5">
                        <div
                          className="bg-accent-dark h-1.5 rounded-full transition-all"
                          style={{ width: `${property.ancer_estimate.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-text-secondary">
                        {Math.round(property.ancer_estimate.confidence * 100)}%
                      </span>
                    </div>
                    {property.ancer_estimate.comparable_count > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        Based on {property.ancer_estimate.comparable_count} comparable propert{property.ancer_estimate.comparable_count === 1 ? 'y' : 'ies'}
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-3">Features</h2>
                    <div className="flex flex-wrap gap-2">
                      {features.map((f) => (
                        <span key={f as string} className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-dark px-3 py-1.5 rounded-lg text-sm font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {property.amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2 text-sm text-text-secondary">
                          <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          {amenity.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Costs */}
                {(property.agency_fee_pct || property.caution_fee_kobo || property.service_charge_kobo || property.legal_fee_kobo) && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-3">Additional Costs</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {property.agency_fee_pct !== null && (
                        <div className="flex justify-between py-2 px-3 bg-background rounded-lg">
                          <span className="text-text-muted">Agency Fee</span>
                          <span className="font-medium">{property.agency_fee_pct}%</span>
                        </div>
                      )}
                      {property.caution_fee_kobo !== null && property.caution_fee_kobo > 0 && (
                        <div className="flex justify-between py-2 px-3 bg-background rounded-lg">
                          <span className="text-text-muted">Caution Fee</span>
                          <span className="font-medium">{formatPrice(property.caution_fee_kobo)}</span>
                        </div>
                      )}
                      {property.service_charge_kobo !== null && property.service_charge_kobo > 0 && (
                        <div className="flex justify-between py-2 px-3 bg-background rounded-lg">
                          <span className="text-text-muted">Service Charge</span>
                          <span className="font-medium">{formatPrice(property.service_charge_kobo)}</span>
                        </div>
                      )}
                      {property.legal_fee_kobo !== null && property.legal_fee_kobo > 0 && (
                        <div className="flex justify-between py-2 px-3 bg-background rounded-lg">
                          <span className="text-text-muted">Legal Fee</span>
                          <span className="font-medium">{formatPrice(property.legal_fee_kobo)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mortgage Calculator — only for sale listings */}
              {property.listing_type === 'sale' && (
                <MortgageCalculator propertyPrice={property.price_kobo} />
              )}

              {/* Neighborhood Insights */}
              {property.area?.id && property.area?.name && (
                <NeighborhoodInsights areaId={property.area.id} areaName={property.area.name} />
              )}

              {/* Market Trends */}
              {property.area?.id && property.area?.name && (
                <MarketTrends areaId={property.area.id} areaName={property.area.name} listingType={property.listing_type} />
              )}
            </div>

            {/* Sidebar - ContactAgent handles desktop view */}
            <div className="space-y-6">
              <ContactAgent property={property} />
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">Similar Properties</h2>
                <Link href={`/properties?listing_type=${property.listing_type}&city_id=${property.city?.id || ''}`} className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} source="similar" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
