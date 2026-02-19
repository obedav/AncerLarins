'use client';

import { useState } from 'react';
import { useGetMyCooperativesQuery } from '@/store/api/cooperativeApi';
import CreateCooperativeForm from '@/components/cooperatives/CreateCooperativeForm';
import Link from 'next/link';

function formatPrice(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function DashboardCooperativesPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useGetMyCooperativesQuery({ page, per_page: 10 });

  const cooperatives = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Cooperatives</h1>
          <p className="text-sm text-text-muted mt-1">Pool resources with others to achieve property goals.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          {showCreate ? 'Close' : '+ New Cooperative'}
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
            <div key={i} className="bg-surface rounded-xl border border-border animate-pulse p-4">
              <div className="h-5 bg-border/50 rounded w-2/3 mb-2" />
              <div className="h-2 bg-border/50 rounded w-full mb-2" />
              <div className="h-4 bg-border/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : cooperatives.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted mb-4">You haven&apos;t joined any cooperatives yet.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
            >
              Start a Cooperative
            </button>
            <Link
              href="/cooperatives"
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-surface transition-colors"
            >
              Browse Cooperatives
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cooperatives.map((coop) => (
            <Link
              key={coop.id}
              href={`/cooperatives/${coop.id}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">{coop.name}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  coop.status === 'active' ? 'bg-green-100 text-green-700' :
                  coop.status === 'forming' ? 'bg-yellow-100 text-yellow-700' :
                  coop.status === 'target_reached' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {coop.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              {/* Progress */}
              <div className="h-1.5 bg-border/50 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${Math.min(100, coop.progress_percentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>{coop.progress_percentage}% — {formatPrice(coop.total_contributed_kobo)} of {formatPrice(coop.target_amount_kobo)}</span>
                <span>{coop.member_count} member{coop.member_count !== 1 ? 's' : ''}</span>
              </div>
            </Link>
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
