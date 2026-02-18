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
import ImageLightbox from '@/components/ui/ImageLightbox';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
        <div className="container-app py-6">
          {/* Breadcrumb skeleton */}
          <div className="flex gap-2 mb-4 animate-pulse">
            <div className="h-4 w-12 bg-border/50 rounded" />
            <div className="h-4 w-4 bg-border/50 rounded" />
            <div className="h-4 w-20 bg-border/50 rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 animate-pulse">
              {/* Gallery skeleton */}
              <div className="rounded-xl overflow-hidden border border-border">
                <div className="h-64 sm:h-80 md:h-96 bg-border/50" />
                <div className="hidden sm:flex gap-2 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-20 h-14 bg-border/50 rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
              {/* Details skeleton */}
              <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-border/50 rounded-full" />
                  <div className="h-6 w-24 bg-border/50 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-8 w-64 bg-border/50 rounded" />
                    <div className="h-4 w-48 bg-border/50 rounded" />
                  </div>
                  <div className="h-8 w-32 bg-border/50 rounded" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-4 border-y border-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-background rounded-xl py-3 px-2 text-center">
                      <div className="h-6 w-8 bg-border/50 rounded mx-auto mb-1" />
                      <div className="h-3 w-14 bg-border/50 rounded mx-auto" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-5 w-28 bg-border/50 rounded" />
                  <div className="h-4 w-full bg-border/50 rounded" />
                  <div className="h-4 w-full bg-border/50 rounded" />
                  <div className="h-4 w-3/4 bg-border/50 rounded" />
                </div>
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="animate-pulse space-y-4">
              <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-border/50 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-border/50 rounded" />
                    <div className="h-3 w-20 bg-border/50 rounded" />
                  </div>
                </div>
                <div className="h-12 bg-border/50 rounded-xl" />
                <div className="h-12 bg-border/50 rounded-xl" />
              </div>
            </div>
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
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="block w-full h-full cursor-zoom-in"
                      aria-label="Open fullscreen gallery"
                    >
                      <Image
                        src={images[activeImage]?.url || ''}
                        alt={images[activeImage]?.caption || property.title}
                        fill
                        className="object-cover"
                        priority
                        draggable={false}
                      />
                    </button>
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
                        aria-label={`View image ${i + 1}`}
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
                    <p className="text-2xl md:text-3xl font-bold text-accent-dark">
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
                  <div className="mt-6 bg-accent-dark/5 border border-accent-dark/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">AncerEstimate</span>
                      <span className="text-xs text-text-muted">Automated valuation</span>
                    </div>
                    <p className="text-2xl font-bold text-accent-dark mb-1">
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

              {/* Nearby Places */}
              {property.nearby_landmarks && property.nearby_landmarks.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Nearby Places</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.nearby_landmarks.map((lm: { id: string; name: string; type: string; distance_km: number }) => (
                      <div key={lm.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent/10 text-accent-dark flex-shrink-0">
                          {lm.type === 'mall' && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 5.25h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                          )}
                          {(lm.type === 'hospital') && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                          {(lm.type === 'university' || lm.type === 'school') && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                          )}
                          {(lm.type === 'airport' || lm.type === 'transport') && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                          )}
                          {lm.type === 'market' && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" /></svg>
                          )}
                          {(lm.type === 'beach' || lm.type === 'recreation') && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                          )}
                          {(lm.type === 'government' || lm.type === 'landmark') && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
                          )}
                          {lm.type === 'worship' && (
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{lm.name}</p>
                          <p className="text-xs text-text-muted capitalize">{lm.type}</p>
                        </div>
                        <span className="text-xs font-medium text-text-secondary whitespace-nowrap">{lm.distance_km} km</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <Link href={`/properties?listing_type=${property.listing_type}&city_id=${property.city?.id || ''}`} className="text-sm font-medium text-accent-dark hover:text-accent transition-colors">
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

      {/* Image Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
