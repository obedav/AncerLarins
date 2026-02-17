'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSavePropertyMutation } from '@/store/api/propertyApi';
import type { PropertyListItem } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  property: PropertyListItem;
  source?: string;
}

function getDaysAgo(dateString: string | null): number | null {
  if (!dateString) return null;
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / 86400000);
}

function formatDaysAgo(days: number): string {
  if (days === 0) return 'Listed today';
  if (days === 1) return 'Listed yesterday';
  if (days < 7) return `Listed ${days}d ago`;
  if (days < 30) return `Listed ${Math.floor(days / 7)}w ago`;
  if (days < 365) return `Listed ${Math.floor(days / 30)}mo ago`;
  return `Listed ${Math.floor(days / 365)}y ago`;
}

export default function PropertyCard({ property, source }: Props) {
  const { isAuthenticated } = useAuth();
  const [saveProperty] = useSavePropertyMutation();
  const [saved, setSaved] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  const coverUrl = property.cover_image?.thumbnail_url || property.cover_image?.url;
  const href = source
    ? `/properties/${property.slug}?ref=${source}`
    : `/properties/${property.slug}`;
  const daysAgo = getDaysAgo(property.published_at);

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setSaveAnimating(true);
    setSaved((prev) => !prev);
    setTimeout(() => setSaveAnimating(false), 300);
    try {
      await saveProperty(property.id).unwrap();
    } catch {
      setSaved((prev) => !prev);
    }
  }, [isAuthenticated, property.id, saveProperty]);

  return (
    <Link href={href} className="group block">
      <div className="bg-surface rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-border/30">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
              </svg>
            </div>
          )}

          {/* Top overlay - badges left, save right */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {/* Left badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-primary/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'short_let' ? 'Short Let' : 'For Rent'}
              </span>
              {property.featured && (
                <span className="bg-accent-dark/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-semibold">
                  Featured
                </span>
              )}
              {property.is_new && (
                <span className="bg-success/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-semibold">
                  New
                </span>
              )}
            </div>

            {/* Save button */}
            {isAuthenticated && (
              <button
                onClick={handleSave}
                className="w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-surface hover:scale-110 active:scale-95 shrink-0"
                aria-label={saved ? 'Unsave property' : 'Save property'}
              >
                <svg
                  className={`w-5 h-5 transition-all duration-300 ${
                    saved ? 'text-error fill-error' : 'text-text-secondary fill-transparent'
                  } ${saveAnimating ? 'scale-125' : ''}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pt-10 pb-3 px-3">
            <div className="flex items-end justify-between">
              {/* Property type */}
              {property.property_type && (
                <span className="bg-surface/90 backdrop-blur-sm text-text-primary text-[11px] px-2 py-0.5 rounded-md font-medium">
                  {property.property_type.name}
                </span>
              )}
              {/* Image count */}
              {property.images_count && property.images_count > 1 && (
                <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {property.images_count}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price row */}
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-primary">
              {formatPrice(property.price_kobo)}
              {property.rent_period && (
                <span className="text-sm font-normal text-text-muted">/{property.rent_period}</span>
              )}
            </p>
            {property.price_negotiable && (
              <span className="text-[11px] text-accent-dark font-medium bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">Negotiable</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-text-primary mt-1.5 truncate group-hover:text-primary-light transition-colors text-[15px] leading-snug">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-sm text-text-muted mt-1 truncate flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.area?.name ? `${property.area.name}, ` : ''}{property.city?.name}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-sm text-text-secondary">
            {property.bedrooms !== null && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                {property.bedrooms} Bed
              </span>
            )}
            {property.bathrooms !== null && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {property.bathrooms} Bath
              </span>
            )}
            {property.toilets !== null && property.toilets !== property.bathrooms && (
              <span className="text-text-muted">{property.toilets} WC</span>
            )}
            {property.floor_area_sqm && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                {property.floor_area_sqm} sqm
              </span>
            )}
          </div>

          {/* Footer: Agent + time ago */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
            {property.agent ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-accent-dark">
                    {(property.agent.company_name || property.agent.user_name || 'A').charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-text-muted truncate max-w-[140px]">
                  {property.agent.company_name || property.agent.user_name || 'Agent'}
                </span>
                {property.agent.is_verified && (
                  <svg className="w-3.5 h-3.5 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ) : (
              <div />
            )}
            {daysAgo !== null && (
              <span className="text-[11px] text-text-muted whitespace-nowrap">
                {formatDaysAgo(daysAgo)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
