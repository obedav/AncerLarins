'use client';

import Link from 'next/link';
import type { CooperativeListItem } from '@/types/cooperative';

function formatPrice(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}K`;
  return `₦${naira.toLocaleString()}`;
}

const STATUS_STYLES: Record<string, string> = {
  forming: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  target_reached: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  dissolved: 'bg-red-100 text-red-600',
};

export default function CooperativeCard({ cooperative }: { cooperative: CooperativeListItem }) {
  return (
    <Link
      href={`/cooperatives/${cooperative.id}`}
      className="block bg-surface border border-border rounded-2xl p-5 hover:shadow-lg hover:border-accent/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-text-primary group-hover:text-accent-dark transition-colors line-clamp-2">
          {cooperative.name}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[cooperative.status] || 'bg-gray-100 text-gray-600'}`}>
          {cooperative.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-muted">Progress</span>
          <span className="font-semibold text-accent-dark">{cooperative.progress_percentage}%</span>
        </div>
        <div className="h-2 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, cooperative.progress_percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{formatPrice(cooperative.total_contributed_kobo)}</span>
          <span>Target: {formatPrice(cooperative.target_amount_kobo)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-text-secondary pt-3 border-t border-border">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {cooperative.member_count} member{cooperative.member_count !== 1 ? 's' : ''}
        </span>
        {cooperative.area && (
          <span className="text-text-muted">{cooperative.area.name}</span>
        )}
      </div>
    </Link>
  );
}
