'use client';

import { useState } from 'react';
import { useGetMyRequestsQuery, useDeletePropertyRequestMutation } from '@/store/api/requestApi';
import CreateRequestForm from '@/components/requests/CreateRequestForm';
import Link from 'next/link';

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `\u20A6${(kobo / 100).toLocaleString()}`;
}

const statusConfig: Record<string, { border: string; badge: string; label: string }> = {
  active: { border: 'border-l-green-500', badge: 'bg-green-50 text-green-700 ring-1 ring-green-600/20', label: 'Active' },
  fulfilled: { border: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20', label: 'Fulfilled' },
  expired: { border: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', label: 'Expired' },
  cancelled: { border: 'border-l-red-500', badge: 'bg-red-50 text-red-700 ring-1 ring-red-600/20', label: 'Cancelled' },
};

const listingTypeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  rent: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21V8.25a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 .75.75V21M4.5 21h1.875M5.25 3.545 12 2.1l6.75 1.445" />
      </svg>
    ),
    label: 'Rent',
  },
  sale: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    label: 'Sale',
  },
  short_let: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    label: 'Short Let',
  },
};

export default function DashboardRequestsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useGetMyRequestsQuery({ page, per_page: 10 });
  const [deleteRequest, { isLoading: isDeleting }] = useDeletePropertyRequestMutation();

  const requests = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest(id).unwrap();
    } catch {
      // handled by RTK Query
    } finally {
      setConfirmingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 bg-primary/10 rounded-lg">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">My Property Requests</h1>
            <p className="text-sm text-text-muted mt-0.5">Post what you&apos;re looking for and let agents come to you.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          {showCreate ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Request
            </>
          )}
        </button>
      </div>

      {showCreate && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <CreateRequestForm
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Requests list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border border-l-4 border-l-border animate-pulse p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-border/40 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-border/40 rounded-md w-3/5 mb-2.5" />
                    <div className="flex items-center gap-3">
                      <div className="h-5 bg-border/40 rounded-full w-16" />
                      <div className="h-4 bg-border/40 rounded w-20" />
                      <div className="h-4 bg-border/40 rounded w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-16 bg-border/40 rounded-lg" />
                  <div className="h-8 w-16 bg-border/40 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No requests yet</h3>
          <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
            Tell agents what you&apos;re looking for. Post a request and receive tailored property matches.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const status = statusConfig[req.status] || statusConfig.cancelled;
            const listingType = listingTypeConfig[req.listing_type] || listingTypeConfig.rent;
            const isConfirming = confirmingDeleteId === req.id;

            return (
              <div
                key={req.id}
                className={`bg-surface border border-border rounded-xl border-l-4 ${status.border} p-5 hover:border-accent-dark/20 transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Listing type icon */}
                    <div className="flex items-center justify-center w-9 h-9 bg-background rounded-lg text-text-muted shrink-0">
                      {listingType.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/requests/${req.id}`} className="font-semibold text-text-primary hover:text-accent-dark transition-colors line-clamp-1">
                        {req.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.badge}`}>
                          {status.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                          </svg>
                          {req.response_count} response{req.response_count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-text-muted bg-background px-2 py-0.5 rounded">
                          {listingType.label}
                        </span>
                        {req.budget_kobo && (
                          <span className="text-xs font-medium text-text-secondary">{formatPrice(req.budget_kobo)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-red-700 font-medium whitespace-nowrap">Cancel request?</span>
                        <button
                          onClick={() => handleDelete(req.id)}
                          disabled={isDeleting}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-50 transition-colors"
                        >
                          Yes
                        </button>
                        <span className="text-red-300">|</span>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/requests/${req.id}`}
                          className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-background transition-colors"
                        >
                          View
                        </Link>
                        {req.status === 'active' && (
                          <button
                            onClick={() => setConfirmingDeleteId(req.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (meta.last_page || 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
