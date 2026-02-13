'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import { useGetPropertyBySlugQuery, useGetSimilarPropertiesQuery, useSavePropertyMutation } from '@/store/api/propertyApi';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useGetPropertyBySlugQuery(slug);
  const property = data?.data;

  const { data: similarData } = useGetSimilarPropertiesQuery(property?.id || '', {
    skip: !property?.id,
  });
  const similar = similarData?.data || [];

  const [saveProperty] = useSavePropertyMutation();
  const [activeImage, setActiveImage] = useState(0);

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
  const agentPhone = property.agent?.whatsapp_number || '';
  const whatsappUrl = generateWhatsAppLink(
    agentPhone,
    `Hi, I'm interested in: ${property.title} on AncerLarins`
  );

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
      <main className="min-h-screen">
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

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
                {property.agent && (
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent-dark font-semibold text-lg">
                          {property.agent.company_name?.[0] || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{property.agent.company_name}</p>
                        {property.agent.user && (
                          <p className="text-sm text-text-muted">{property.agent.user.full_name}</p>
                        )}
                      </div>
                    </div>
                    {property.agent.verification_status === 'verified' && (
                      <div className="flex items-center gap-1 text-success text-sm mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        Verified Agent
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp - PROMINENT */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white py-3.5 rounded-xl font-semibold text-base transition-colors mb-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Agent
                </a>

                <a
                  href={`tel:${agentPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-medium text-sm transition-colors mb-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  Call Agent
                </a>

                <button
                  onClick={() => property.id && saveProperty(property.id)}
                  className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent-dark text-text-secondary py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  Save Property
                </button>
              </div>
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-text-primary mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating WhatsApp (Mobile) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-whatsapp hover:bg-whatsapp/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        aria-label="WhatsApp Agent"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <Footer />
    </>
  );
}
