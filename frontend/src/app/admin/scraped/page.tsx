'use client';

import { useState } from 'react';
import {
  useGetScrapedListingsQuery,
  useApproveScrapedListingMutation,
  useRejectScrapedListingMutation,
} from '@/store/api/adminApi';

function formatNaira(kobo: number | null): string {
  if (!kobo) return '-';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

const SOURCES = ['all', 'propertypro', 'nigeriapropertycentre', 'jiji'];
const STATUSES = ['all', 'pending', 'imported', 'rejected', 'duplicate'];

const SOURCE_ICONS: Record<string, string> = {
  propertypro: 'PP',
  nigeriapropertycentre: 'NPC',
  jiji: 'JJ',
};

export default function AdminScrapedPage() {
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, per_page: 20 };
  if (source !== 'all') params.source = source;
  if (status !== 'all') params.status = status;

  const { data, isLoading } = useGetScrapedListingsQuery(params);
  const [approveListing] = useApproveScrapedListingMutation();
  const [rejectListing] = useRejectScrapedListingMutation();

  const listings = data?.data || [];
  const meta = data?.meta;

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-accent/20 text-accent-dark';
      case 'imported': return 'bg-success/15 text-success';
      case 'rejected': return 'bg-error/15 text-error';
      case 'duplicate': return 'bg-text-muted/15 text-text-muted';
      default: return 'bg-border text-text-secondary';
    }
  };

  const statusBorderColor = (s: string) => {
    switch (s) {
      case 'pending': return 'border-l-accent-dark';
      case 'imported': return 'border-l-success';
      case 'rejected': return 'border-l-error';
      case 'duplicate': return 'border-l-border';
      default: return 'border-l-border';
    }
  };

  return (
    <div className="space-y-6">

      {/* Clean Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Scraped Listings</h1>
          <p className="text-sm text-text-muted">Review and import property listings from external sources</p>
        </div>
      </div>

      {/* Segmented Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-surface border border-border rounded-xl p-1 inline-flex gap-0.5">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => { setSource(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                source === s ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-background'
              }`}
            >
              {s === 'nigeriapropertycentre' ? 'NPC' : s}
            </button>
          ))}
        </div>
        <div className="bg-surface border border-border rounded-xl p-1 inline-flex gap-0.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                status === s ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-background'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-border/50 rounded-full w-16" />
                    <div className="h-4 bg-border/50 rounded w-12" />
                  </div>
                  <div className="h-5 bg-border/50 rounded w-2/3" />
                  <div className="h-4 bg-border/50 rounded w-1/3" />
                </div>
                <div className="w-20 h-16 bg-border/50 rounded-lg shrink-0" />
              </div>
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">No scraped listings found</h3>
            <p className="text-sm text-text-muted">No listings match the current filters.</p>
          </div>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-surface border border-border rounded-xl p-4 border-l-4 hover:border-accent-dark/20 transition-colors ${statusBorderColor(listing.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <span className="w-5 h-5 rounded bg-background flex items-center justify-center text-[9px] font-bold text-text-secondary">
                        {SOURCE_ICONS[listing.source] || listing.source?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="capitalize">{listing.source}</span>
                    </span>
                    {listing.dedup_score !== null && listing.dedup_score > 0 && (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <div className="w-12 h-1.5 bg-border/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${listing.dedup_score > 0.7 ? 'bg-error' : listing.dedup_score > 0.4 ? 'bg-accent-dark' : 'bg-success'}`}
                            style={{ width: `${Math.round(listing.dedup_score * 100)}%` }}
                          />
                        </div>
                        {Math.round(listing.dedup_score * 100)}% match
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary truncate">{listing.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-text-secondary">
                    <span className="font-medium">{formatNaira(listing.price_kobo)}</span>
                    {listing.bedrooms && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        {listing.bedrooms} bed
                      </span>
                    )}
                    {listing.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        {listing.location}
                      </span>
                    )}
                    {listing.listing_type && <span className="capitalize text-xs bg-background px-2 py-0.5 rounded-full">{listing.listing_type}</span>}
                  </div>
                  <a
                    href={listing.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent-dark hover:underline mt-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    View source
                  </a>
                </div>

                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt=""
                    className="w-24 h-18 object-cover rounded-xl shrink-0 ring-1 ring-border"
                  />
                )}
              </div>

              {listing.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => approveListing(listing.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Approve & Import
                  </button>
                  <button
                    onClick={() => rejectListing(listing.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Page {meta.current_page} of {meta.last_page} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (meta.last_page || 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
