'use client';

import { useState } from 'react';
import { useGetMyRequestsQuery, useDeletePropertyRequestMutation } from '@/store/api/requestApi';
import CreateRequestForm from '@/components/requests/CreateRequestForm';
import Link from 'next/link';

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function DashboardRequestsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useGetMyRequestsQuery({ page, per_page: 10 });
  const [deleteRequest] = useDeletePropertyRequestMutation();

  const requests = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this request?')) return;
    try {
      await deleteRequest(id).unwrap();
    } catch {
      // handled by RTK Query
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Property Requests</h1>
          <p className="text-sm text-text-muted mt-1">Post what you&apos;re looking for and let agents come to you.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          {showCreate ? 'Close' : '+ New Request'}
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
            <div key={i} className="bg-surface rounded-xl border border-border animate-pulse p-4">
              <div className="h-5 bg-border/50 rounded w-2/3 mb-2" />
              <div className="h-4 bg-border/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted mb-4">You haven&apos;t posted any requests yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            Post Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link href={`/requests/${req.id}`} className="font-semibold text-text-primary hover:text-accent-dark transition-colors line-clamp-1">
                  {req.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                  <span className={`font-medium ${
                    req.status === 'active' ? 'text-green-600' :
                    req.status === 'fulfilled' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  <span>{req.response_count} response{req.response_count !== 1 ? 's' : ''}</span>
                  {req.budget_kobo && <span>{formatPrice(req.budget_kobo)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/requests/${req.id}`}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-background transition-colors"
                >
                  View
                </Link>
                {req.status === 'active' && (
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

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
