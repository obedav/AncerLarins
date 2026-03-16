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

const SEVERITY_BORDER: Record<string, string> = {
  open: 'border-l-error',
  investigating: 'border-l-accent-dark',
  resolved: 'border-l-success',
  dismissed: 'border-l-border',
};

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

  // Compute stats from current data
  const openCount = reports.filter(r => r.status === 'open').length;
  const investigatingCount = reports.filter(r => r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">

      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Reports</h1>
            <p className="text-sm text-text-muted">{meta?.total ?? 0} total reports</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent-dark/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{openCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Open Reports</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent-dark/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent-dark/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{investigatingCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Investigating</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent-dark/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{resolvedCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="bg-surface border border-border rounded-xl p-1 inline-flex flex-wrap gap-0.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === tab.value ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-border/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/50 rounded w-1/2" />
                  <div className="h-3 bg-border/50 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-border/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">No reports found</h3>
          <p className="text-sm text-text-muted">No reports match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const link = getReportableLink(report);
            return (
              <div
                key={report.id}
                className={`bg-surface border border-border rounded-xl p-4 border-l-4 hover:border-accent-dark/20 transition-colors ${SEVERITY_BORDER[report.status] || 'border-l-border'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                      </div>
                      <ReportStatusBadge status={report.status} />
                      <span className="text-xs text-text-muted capitalize">{report.reportable_type.replace('_', ' ')}</span>
                      <span className="text-xs text-text-muted">&middot; {formatRelativeTime(report.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary ml-10">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-text-muted mt-1 ml-10">{report.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted ml-10">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        {report.reporter?.full_name || 'Unknown'}
                      </span>
                      {report.reportable && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                          {report.reportable.title || report.reportable.company_name || report.reportable_id}
                        </span>
                      )}
                    </div>
                    {report.resolution_note && (
                      <div className="flex items-center gap-1.5 mt-2 ml-10 text-xs text-success bg-success/10 px-3 py-1.5 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Resolution: {report.resolution_note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {link && (
                      <Link href={link} target="_blank" className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-lg border border-border hover:bg-background transition-colors">
                        View
                      </Link>
                    )}
                    {(report.status === 'open' || report.status === 'investigating') && (
                      <>
                        <button
                          onClick={() => setResolveModal(report.id)}
                          className="text-xs bg-success/10 text-success px-3 py-1.5 rounded-lg font-medium hover:bg-success/20 transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDismiss(report.id)}
                          className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-background transition-colors"
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
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page} ({meta.total} total)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 hover:bg-background transition-colors">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-40 hover:bg-background transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setResolveModal(null); setResolveNote(''); }}>
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-text-primary text-center text-lg mb-1">Resolve Report</h3>
            <p className="text-sm text-text-muted text-center mb-4">Provide a resolution note explaining how this report was handled.</p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Resolution note..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button onClick={() => { setResolveModal(null); setResolveNote(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-background transition-colors">Cancel</button>
              <button onClick={handleResolve} disabled={!resolveNote.trim()} className="flex-1 px-4 py-2.5 rounded-xl bg-success text-white text-sm font-semibold disabled:opacity-50 hover:bg-success/90 transition-colors">Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
