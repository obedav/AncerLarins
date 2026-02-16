'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import ContactAgent from '@/components/property/ContactAgent';
import { useGetPropertyBySlugQuery, useGetSimilarPropertiesQuery } from '@/store/api/propertyApi';
import { formatPrice, setLeadSource } from '@/lib/utils';

export default function PropertyDetailContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useGetPropertyBySlugQuery(slug);
  const property = data?.data;

  const { data: similarData } = useGetSimilarPropertiesQuery(property?.id || '', {
    skip: !property?.id,
  });
  const similar = similarData?.data || [];

  const [activeImage, setActiveImage] = useState(0);

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
          <nav className="text-sm text-text-muted mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/properties" className="hover:text-primary">Properties</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{property.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="rounded-xl overflow-hidden bg-surface border border-border">
                <div className="relative h-64 sm:h-80 md:h-96">
                  {images.length > 0 ? (
                    <Image
                      src={images[activeImage]?.url || ''}
                      alt={images[activeImage]?.caption || property.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-border/30 text-text-muted">No Images</div>
                  )}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-primary/80 text-white text-sm px-3 py-1 rounded-full">
                      {activeImage + 1} / {images.length}
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
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
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{property.title}</h1>
                    <p className="text-text-muted mt-1">
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
                      <span className="text-accent-dark text-xs font-medium">Negotiable</span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                  {property.bedrooms !== null && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-text-primary">{property.bedrooms}</p>
                      <p className="text-xs text-text-muted">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms !== null && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-text-primary">{property.bathrooms}</p>
                      <p className="text-xs text-text-muted">Bathrooms</p>
                    </div>
                  )}
                  {property.toilets !== null && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-text-primary">{property.toilets}</p>
                      <p className="text-xs text-text-muted">Toilets</p>
                    </div>
                  )}
                  {property.floor_area_sqm && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-text-primary">{property.floor_area_sqm}</p>
                      <p className="text-xs text-text-muted">sqm</p>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary capitalize">{property.furnishing.replace('_', ' ')}</p>
                      <p className="text-xs text-text-muted">Furnishing</p>
                    </div>
                  )}
                </div>

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
                        <span key={f as string} className="bg-accent/10 text-accent-dark px-3 py-1.5 rounded-lg text-sm font-medium">
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
            </div>

            {/* Sidebar - ContactAgent handles desktop view */}
            <div className="space-y-6">
              <ContactAgent property={property} />
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-text-primary mb-6">Similar Properties</h2>
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
