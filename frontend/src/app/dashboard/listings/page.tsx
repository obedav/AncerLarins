'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMyListingsQuery } from '@/store/api/agentApi';
import { useDeletePropertyMutation } from '@/store/api/propertyApi';
import { PropertyStatusBadge } from '@/components/dashboard/StatusBadge';
import { formatPrice, formatDate } from '@/lib/utils';
import type { PropertyStatus } from '@/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'rented', label: 'Rented' },
  { value: 'sold', label: 'Sold' },
];

export default function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyListingsQuery({
    status: statusFilter || undefined,
    page,
    per_page: 20,
  });
  const [deleteProperty] = useDeletePropertyMutation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const properties = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id).unwrap();
      setDeleteConfirm(null);
    } catch { /* handled by RTK */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Listings</h1>
          {meta && <p className="text-sm text-text-muted mt-1">{meta.total} total properties</p>}
        </div>
        <Link
          href="/dashboard/listings/new"
          className="bg-accent hover:bg-accent-dark text-primary px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + Add New Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:border-accent-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse flex gap-4">
              <div className="w-20 h-16 bg-border/50 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border/50 rounded w-1/2" />
                <div className="h-3 bg-border/50 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted mb-4">
            {statusFilter ? 'No listings match this filter.' : 'You haven\'t created any listings yet.'}
          </p>
          <Link href="/dashboard/listings/new" className="text-accent-dark font-medium hover:underline">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden md:table-cell">Views</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden md:table-cell">Leads</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-border/50 overflow-hidden shrink-0">
                          {p.cover_image?.thumbnail_url && (
                            <img src={p.cover_image.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/properties/${p.slug}`} className="text-text-primary font-medium hover:text-accent-dark truncate block">
                            {p.title}
                          </Link>
                          <p className="text-xs text-text-muted truncate">{p.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium hidden sm:table-cell whitespace-nowrap">
                      {formatPrice(p.price_kobo)}
                    </td>
                    <td className="px-4 py-3">
                      <PropertyStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden md:table-cell">
                      {(p.views_count ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden md:table-cell">
                      {p.leads_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                      {p.created_at ? formatDate(p.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/listings/${p.id}/edit`}
                          className="text-xs text-text-secondary hover:text-accent-dark px-2 py-1"
                        >
                          Edit
                        </Link>
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs text-error font-medium px-2 py-1"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-text-muted px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="text-xs text-text-muted hover:text-error px-2 py-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-text-muted">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                  disabled={page === meta.last_page}
                  className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40"
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
