'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { formatPrice } from '@/lib/utils';
import type { PropertyListItem } from '@/types';

function PropertyCardDark({ property }: { property: PropertyListItem }) {
  const coverImage = property.cover_image?.url || property.cover_image?.thumbnail_url || '';

  return (
    <div className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-accent/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[#2A2A2A] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#3A3A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 13.5V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v7.5" />
            </svg>
          </div>
        )}
        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-accent text-xl font-bold">{formatPrice(property.price_kobo)}</span>
          {property.rent_period && (
            <span className="text-white/30 text-xs">/{property.rent_period}</span>
          )}
        </div>

        {/* Location */}
        <p className="text-white/50 text-sm truncate mb-4">
          {property.area?.name ? `${property.area.name}, ` : ''}{property.city?.name || 'Lagos'}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-5 py-4 border-t border-[#2A2A2A]">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="text-center">
              <p className="text-white text-lg font-bold">{String(property.bedrooms).padStart(2, '0')}</p>
              <p className="text-white/40 text-[11px]">Bedrooms</p>
            </div>
          )}
          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="text-center">
              <p className="text-white text-lg font-bold">{String(property.bathrooms).padStart(2, '0')}</p>
              <p className="text-white/40 text-[11px]">Bathrooms</p>
            </div>
          )}
          {property.floor_area_sqm && (
            <div className="text-center">
              <p className="text-white text-lg font-bold">{property.floor_area_sqm}</p>
              <p className="text-white/40 text-[11px]">sqm</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/properties/${property.slug}`}
          className="block w-full text-center bg-accent/10 hover:bg-accent hover:text-primary border border-accent/40 text-accent py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 mt-4"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] animate-pulse">
      <div className="aspect-[4/3] bg-[#2A2A2A]" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-[#2A2A2A] rounded w-1/2" />
        <div className="h-4 bg-[#2A2A2A] rounded w-3/4" />
        <div className="flex gap-6 py-4 border-t border-[#2A2A2A]">
          <div className="h-10 bg-[#2A2A2A] rounded w-14" />
          <div className="h-10 bg-[#2A2A2A] rounded w-14" />
          <div className="h-10 bg-[#2A2A2A] rounded w-14" />
        </div>
        <div className="h-11 bg-[#2A2A2A] rounded-xl" />
      </div>
    </div>
  );
}

export default function FeaturedProperties() {
  const { data, isLoading } = useGetPropertiesQuery({ per_page: 6, sort_by: 'newest', min_price: 10000000000 });
  const properties = data?.data || [];
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-primary" aria-label="Latest properties">
      <div className="container-app" ref={ref}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="reveal-left" data-visible={isVisible}>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo-white.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 opacity-60"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-white font-playfair">
                Latest<br />properties
              </h2>
            </div>
          </div>
          <p className="text-white/40 max-w-md text-sm leading-relaxed reveal-right" data-visible={isVisible}>
            Proprietary technology, latest market data and strong real estate expertise
            allow us to reach potential buyers and present them with a well-priced property.
          </p>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-[#2A2A2A]">
            <svg className="w-12 h-12 mx-auto mb-3 text-[#2A2A2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-white/40 text-sm">No properties available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((property) => (
              <PropertyCardDark key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            href="/properties?sort_by=newest"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-semibold transition-colors group uppercase tracking-wider text-sm"
          >
            View All Properties
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
