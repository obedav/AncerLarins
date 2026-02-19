'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { EstateListItem } from '@/types/estate';

const ESTATE_TYPE_LABELS: Record<string, string> = {
  gated_estate: 'Gated Estate',
  open_estate: 'Open Estate',
  highrise: 'Highrise',
  mixed_use: 'Mixed Use',
};

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function EstateCard({ estate }: { estate: EstateListItem }) {
  return (
    <Link
      href={`/estates/${estate.slug}`}
      className="block bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all group"
    >
      {/* Image */}
      <div className="aspect-[16/9] bg-border/30 relative overflow-hidden">
        {estate.cover_image_url ? (
          <Image
            src={estate.cover_image_url}
            alt={estate.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <svg className="w-10 h-10 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-semibold bg-primary/90 text-white px-2.5 py-1 rounded-lg">
          {ESTATE_TYPE_LABELS[estate.estate_type] || estate.estate_type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary group-hover:text-accent-dark transition-colors mb-1">
          {estate.name}
        </h3>

        {estate.area && (
          <p className="text-sm text-text-muted mb-3">{estate.area.name}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-secondary">
          {estate.avg_rating && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {estate.avg_rating}
            </span>
          )}
          {estate.security_type && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {estate.security_type}
            </span>
          )}
          {estate.service_charge_kobo && (
            <span className="font-medium text-accent-dark">
              {formatPrice(estate.service_charge_kobo)}/{estate.service_charge_period || 'yr'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
