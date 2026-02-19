'use client';

import Link from 'next/link';
import type { PropertyRequestListItem } from '@/types/request';

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `₦${(kobo / 100).toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function RequestCard({ request }: { request: PropertyRequestListItem }) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block bg-surface border border-border rounded-2xl p-5 hover:shadow-lg hover:border-accent/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-text-primary group-hover:text-accent-dark transition-colors line-clamp-2">
          {request.title}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
          request.listing_type === 'rent'
            ? 'bg-blue-100 text-blue-700'
            : request.listing_type === 'sale'
            ? 'bg-green-100 text-green-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {request.listing_type === 'short_let' ? 'Short Let' : request.listing_type.charAt(0).toUpperCase() + request.listing_type.slice(1)}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-secondary mb-3">
        {request.area && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {request.area.name}
          </span>
        )}
        {(request.min_bedrooms || request.max_bedrooms) && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {request.min_bedrooms && request.max_bedrooms
              ? `${request.min_bedrooms}–${request.max_bedrooms} bed`
              : request.min_bedrooms
              ? `${request.min_bedrooms}+ bed`
              : `Up to ${request.max_bedrooms} bed`}
          </span>
        )}
        {request.budget_kobo && (
          <span className="font-semibold text-accent-dark">{formatPrice(request.budget_kobo)}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
        <span>{request.response_count} response{request.response_count !== 1 ? 's' : ''}</span>
        <span>{timeAgo(request.created_at)}</span>
      </div>
    </Link>
  );
}
