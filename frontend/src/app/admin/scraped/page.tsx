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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Scraped Listings</h1>
        <p className="text-text-secondary mt-1">Review and import property listings from external sources</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => { setSource(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                source === s ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
              }`}
            >
              {s === 'nigeriapropertycentre' ? 'NPC' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                status === s ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
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
              <div className="h-5 bg-border rounded w-2/3 mb-2" />
              <div className="h-4 bg-border rounded w-1/3" />
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-muted">
            No scraped listings found.
          </div>
        ) : (
          listings.map((listing) => (
            <div key={listing.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                    <span className="text-xs text-text-muted capitalize">{listing.source}</span>
                    {listing.dedup_score !== null && listing.dedup_score > 0 && (
                      <span className="text-xs text-text-muted">
                        Match: {Math.round(listing.dedup_score * 100)}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary truncate">{listing.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-secondary">
                    <span>{formatNaira(listing.price_kobo)}</span>
                    {listing.bedrooms && <span>{listing.bedrooms} bed</span>}
                    {listing.location && <span>{listing.location}</span>}
                    {listing.listing_type && <span className="capitalize">{listing.listing_type}</span>}
                  </div>
                  <a
                    href={listing.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-dark hover:underline mt-1 inline-block"
                  >
                    View source
                  </a>
                </div>

                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg shrink-0"
                  />
                )}
              </div>

              {listing.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => approveListing(listing.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectListing(listing.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                  >
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
          <p className="text-sm text-text-muted">
            Page {meta.current_page} of {meta.last_page} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (meta.last_page || 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
