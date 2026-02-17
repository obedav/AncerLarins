'use client';

import { useState } from 'react';
import { useGetAdminAgentsQuery, useVerifyAgentMutation, useRejectAgentMutation } from '@/store/api/adminApi';
import { VerificationBadge } from '@/components/dashboard/StatusBadge';
import type { VerificationStatus } from '@/types';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminAgentsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminAgentsQuery({
    verification_status: statusFilter || undefined,
    page,
    per_page: 20,
  });
  const [verifyAgent] = useVerifyAgentMutation();
  const [rejectAgent] = useRejectAgentMutation();

  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const agents = data?.data || [];
  const meta = data?.meta;

  const handleVerify = async (agentProfileId: string) => {
    try {
      await verifyAgent({ agent_profile_id: agentProfileId }).unwrap();
    } catch { /* RTK */ }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    try {
      await rejectAgent({ agent_profile_id: rejectModal, rejection_reason: rejectReason }).unwrap();
      setRejectModal(null);
      setRejectReason('');
    } catch { /* RTK */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Agent Management</h1>

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
              <div className="h-4 bg-border/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No agents match this filter.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">Business Name</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">Tier</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden md:table-cell">Listings</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Leads</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Rating</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {agent.logo_url ? (
                          <img src={agent.logo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark text-sm font-bold">
                            {(agent.user?.full_name || 'A').charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-text-primary font-medium">{agent.user?.full_name || '-'}</p>
                          <p className="text-xs text-text-muted">{agent.user?.email || agent.user?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{agent.company_name}</td>
                    <td className="px-4 py-3"><VerificationBadge status={agent.verification_status} /></td>
                    <td className="px-4 py-3 text-text-secondary capitalize hidden md:table-cell">{agent.subscription_tier}</td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden md:table-cell">{agent.active_listings ?? agent.properties_count ?? 0}</td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">{agent.total_leads ?? 0}</td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">{agent.avg_rating ? agent.avg_rating.toFixed(1) : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {agent.verification_status === 'pending' && (
                          <>
                            <button onClick={() => handleVerify(agent.id)} className="text-xs bg-success text-white px-2.5 py-1 rounded-lg font-medium hover:bg-success/90">
                              Verify
                            </button>
                            <button onClick={() => setRejectModal(agent.id)} className="text-xs text-error hover:bg-error/5 px-2.5 py-1 rounded-lg font-medium">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full border border-border">
            <h3 className="font-semibold text-text-primary mb-4">Reject Agent</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="px-4 py-2 rounded-xl bg-error text-white text-sm font-medium disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
