'use client';

import { useState } from 'react';
import {
  useGetAdminCooperativesQuery,
  useGetAdminCooperativeQuery,
  useUpdateCooperativeStatusMutation,
  useDeleteCooperativeMutation,
} from '@/store/api/cooperativeApi';
import { formatDate, formatPrice } from '@/lib/utils';
import type { CooperativeStatus } from '@/types/cooperative';

const STATUS_TABS: { value: '' | CooperativeStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'forming', label: 'Forming' },
  { value: 'active', label: 'Active' },
  { value: 'target_reached', label: 'Target Reached' },
  { value: 'completed', label: 'Completed' },
  { value: 'dissolved', label: 'Dissolved' },
];

const STATUS_COLORS: Record<CooperativeStatus, string> = {
  forming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  target_reached: 'bg-amber-100 text-amber-700',
  completed: 'bg-purple-100 text-purple-700',
  dissolved: 'bg-red-100 text-red-700',
};

export default function AdminCooperativesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | CooperativeStatus>('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<CooperativeStatus>('forming');

  const { data, isLoading } = useGetAdminCooperativesQuery({
    page,
    per_page: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const { data: detailData } = useGetAdminCooperativeQuery(detailId!, { skip: !detailId });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateCooperativeStatusMutation();
  const [deleteCooperative] = useDeleteCooperativeMutation();

  const cooperatives = data?.data || [];
  const meta = data?.meta;
  const detail = detailData?.data;

  const handleStatusUpdate = async (id: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      setStatusChangeId(null);
    } catch { /* RTK handles */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cooperative?')) return;
    try {
      await deleteCooperative(id).unwrap();
    } catch { /* RTK handles */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Cooperative Management</h1>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:bg-background'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : cooperatives.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No cooperatives found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cooperatives.map((coop) => (
            <div key={coop.id} className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{coop.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[coop.status]}`}>
                      {coop.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-text-muted">{coop.member_count} members</span>
                    {coop.area && <span className="text-xs text-text-muted">{coop.area.name}</span>}
                    <span className="text-xs text-text-muted">{formatDate(coop.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDetailId(coop.id)}
                    className="text-xs text-primary hover:underline px-2 py-1"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { setStatusChangeId(statusChangeId === coop.id ? null : coop.id); setNewStatus(coop.status); }}
                    className="text-xs text-amber-600 hover:underline px-2 py-1"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => handleDelete(coop.id)}
                    className="text-xs text-error hover:underline px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${coop.progress_percentage}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatPrice(coop.total_contributed_kobo)} / {formatPrice(coop.target_amount_kobo)} ({coop.progress_percentage}%)
                </span>
              </div>

              {/* Inline status change */}
              {statusChangeId === coop.id && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CooperativeStatus)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
                  >
                    {STATUS_TABS.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(coop.id)}
                    disabled={updatingStatus}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setStatusChangeId(null)}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailId && detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailId(null)}>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">{detail.name}</h2>
              <button onClick={() => setDetailId(null)} className="text-text-muted hover:text-text-primary text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[detail.status]}`}>
                    {detail.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div><span className="text-text-muted">Members:</span> <span className="text-text-primary">{detail.member_count}</span></div>
                <div><span className="text-text-muted">Target:</span> <span className="text-text-primary">{formatPrice(detail.target_amount_kobo)}</span></div>
                <div><span className="text-text-muted">Contributed:</span> <span className="text-text-primary">{formatPrice(detail.total_contributed_kobo)}</span></div>
                {detail.area && <div><span className="text-text-muted">Area:</span> <span className="text-text-primary">{detail.area.name}</span></div>}
                {detail.admin_user && <div><span className="text-text-muted">Admin:</span> <span className="text-text-primary">{detail.admin_user.full_name}</span></div>}
                {detail.start_date && <div><span className="text-text-muted">Start:</span> <span className="text-text-primary">{formatDate(detail.start_date)}</span></div>}
                {detail.target_date && <div><span className="text-text-muted">Target Date:</span> <span className="text-text-primary">{formatDate(detail.target_date)}</span></div>}
              </div>

              {detail.description && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Description</p>
                  <p className="text-sm text-text-primary">{detail.description}</p>
                </div>
              )}

              {/* Members list */}
              {detail.members && detail.members.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Members ({detail.members.length})</p>
                  <div className="space-y-2">
                    {detail.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-background rounded-lg p-3 text-sm">
                        <div>
                          <span className="text-text-primary">{member.user?.full_name || 'Unknown'}</span>
                          <span className="text-xs text-text-muted ml-2 capitalize">{member.role}</span>
                        </div>
                        <span className="text-text-muted">{formatPrice(member.total_contributed_kobo)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
