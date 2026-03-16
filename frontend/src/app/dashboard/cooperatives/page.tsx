'use client';

import { useState } from 'react';
import { useGetMyCooperativesQuery } from '@/store/api/cooperativeApi';
import CreateCooperativeForm from '@/components/cooperatives/CreateCooperativeForm';
import Link from 'next/link';

function formatPrice(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString()}`;
}

const statusConfig: Record<string, { dot: string; badge: string; label: string }> = {
  forming: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', label: 'Forming' },
  active: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 ring-1 ring-green-600/20', label: 'Active' },
  target_reached: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20', label: 'Target Reached' },
  completed: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20', label: 'Completed' },
  dissolved: { dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20', label: 'Dissolved' },
};

export default function DashboardCooperativesPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useGetMyCooperativesQuery({ page, per_page: 10 });

  const cooperatives = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 bg-primary/10 rounded-lg">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">My Cooperatives</h1>
            <p className="text-sm text-text-muted mt-0.5">Pool resources with others to achieve property goals.</p>
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
              New Cooperative
            </>
          )}
        </button>
      </div>

      {showCreate && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <CreateCooperativeForm
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border animate-pulse p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-border/40 rounded-md w-2/5" />
                <div className="h-5 bg-border/40 rounded-full w-20" />
              </div>
              <div className="h-2 bg-border/40 rounded-full w-full mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-4 bg-border/40 rounded w-1/3" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-border/40 rounded" />
                  <div className="h-4 bg-border/40 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : cooperatives.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No cooperatives yet</h3>
          <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
            Join forces with others to pool resources and achieve your property goals together.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Start a Cooperative
            </button>
            <Link
              href="/cooperatives"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-background transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Browse Cooperatives
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cooperatives.map((coop) => {
            const status = statusConfig[coop.status] || statusConfig.dissolved;
            const progressPct = Math.min(100, coop.progress_percentage);

            return (
              <Link
                key={coop.id}
                href={`/cooperatives/${coop.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-accent-dark/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary line-clamp-1">{coop.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-border/40 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-accent-dark rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-accent-dark font-semibold">{coop.progress_percentage}%</span>
                    <span className="text-text-muted">
                      &mdash; {formatPrice(coop.total_contributed_kobo)} of {formatPrice(coop.target_amount_kobo)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-text-muted">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    {coop.member_count} member{coop.member_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
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
