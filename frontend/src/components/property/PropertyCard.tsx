'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PropertyListItem } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  property: PropertyListItem;
  source?: string;
}

export default function PropertyCard({ property, source }: Props) {
  const coverUrl = property.cover_image?.thumbnail_url || property.cover_image?.url;
  const href = source
    ? `/properties/${property.slug}?ref=${source}`
    : `/properties/${property.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
        {/* Image */}
        <div className="relative h-52 sm:h-48 bg-border/50">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
              </svg>
            </div>
          )}

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-primary/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
              {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'short_let' ? 'Short Let' : 'For Rent'}
            </span>
            {property.featured && (
              <span className="bg-accent-dark/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {property.is_new && (
              <span className="bg-success/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                New
              </span>
            )}
          </div>

          {/* Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {property.agent?.is_verified && (
              <div className="bg-surface/90 backdrop-blur-sm rounded-full p-1.5" title="Verified Agent">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Bottom gradient overlay for price readability */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Property Type Tag - bottom left */}
          {property.property_type && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface/90 backdrop-blur-sm text-text-primary text-xs px-2 py-1 rounded-md font-medium">
                {property.property_type.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-primary">
              {formatPrice(property.price_kobo)}
              {property.rent_period && (
                <span className="text-sm font-normal text-text-muted">/{property.rent_period}</span>
              )}
            </p>
            {property.price_negotiable && (
              <span className="text-xs text-accent-dark font-medium bg-accent/10 px-2 py-0.5 rounded-full">Negotiable</span>
            )}
          </div>
          <h3 className="font-semibold text-text-primary mt-1.5 truncate group-hover:text-primary-light transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-text-muted mt-0.5 truncate flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.area?.name ? `${property.area.name}, ` : ''}{property.city?.name}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-sm text-text-secondary">
            {property.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                {property.bedrooms} Bed
              </span>
            )}
            {property.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {property.bathrooms} Bath
              </span>
            )}
            {property.toilets !== null && property.toilets !== property.bathrooms && (
              <span className="flex items-center gap-1 text-text-muted">
                {property.toilets} WC
              </span>
            )}
            {property.floor_area_sqm && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                {property.floor_area_sqm} sqm
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
