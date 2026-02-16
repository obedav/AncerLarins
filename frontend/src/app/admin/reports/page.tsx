'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetAdminReportsQuery, useResolveReportMutation, useDismissReportMutation } from '@/store/api/adminApi';
import { ReportStatusBadge } from '@/components/dashboard/StatusBadge';
import { formatRelativeTime } from '@/lib/utils';

const STATUS_TABS = [
  { value: 'open', label: 'Open' },
  { value: '', label: 'All' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('open');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminReportsQuery({ status: statusFilter || undefined, page, per_page: 20 });
  const [resolveReport] = useResolveReportMutation();
  const [dismissReport] = useDismissReportMutation();

  const [resolveModal, setResolveModal] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const reports = data?.data || [];
  const meta = data?.meta;

  const handleResolve = async () => {
    if (!resolveModal || !resolveNote.trim()) return;
    try {
      await resolveReport({ id: resolveModal, resolution_note: resolveNote }).unwrap();
      setResolveModal(null);
      setResolveNote('');
    } catch { /* RTK */ }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissReport(id).unwrap();
    } catch { /* RTK */ }
  };

  const getReportableLink = (report: typeof reports[0]) => {
    if (report.reportable_type === 'property' && report.reportable?.slug) {
      return `/properties/${report.reportable.slug}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Reports</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-border/50 rounded w-1/2 mb-2" />
              <div className="h-3 bg-border/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No reports match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const link = getReportableLink(report);
            return (
              <div key={report.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ReportStatusBadge status={report.status} />
                      <span className="text-xs text-text-muted capitalize">{report.reportable_type.replace('_', ' ')}</span>
                      <span className="text-xs text-text-muted">&middot; {formatRelativeTime(report.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-text-muted mt-1">{report.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span>Reporter: {report.reporter?.full_name || 'Unknown'}</span>
                      {report.reportable && (
                        <span>
                          Target: {report.reportable.title || report.reportable.company_name || report.reportable_id}
                        </span>
                      )}
                    </div>
                    {report.resolution_note && (
                      <p className="text-xs text-green-600 mt-2">Resolution: {report.resolution_note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {link && (
                      <Link href={link} target="_blank" className="text-xs text-text-muted hover:text-text-primary px-2 py-1">
                        View
                      </Link>
                    )}
                    {(report.status === 'open' || report.status === 'investigating') && (
                      <>
                        <button
                          onClick={() => setResolveModal(report.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDismiss(report.id)}
                          className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full border border-border">
            <h3 className="font-semibold text-text-primary mb-4">Resolve Report</h3>
            <textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} placeholder="Resolution note..." rows={3} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setResolveModal(null); setResolveNote(''); }} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
              <button onClick={handleResolve} disabled={!resolveNote.trim()} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium disabled:opacity-50">Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
