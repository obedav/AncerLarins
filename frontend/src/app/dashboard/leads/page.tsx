'use client';

import { useState } from 'react';
import { useGetAgentLeadsQuery, useRespondToLeadMutation } from '@/store/api/agentApi';
import { formatRelativeTime, formatDate } from '@/lib/utils';

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAgentLeadsQuery({ page, per_page: 20 });
  const [respondToLead] = useRespondToLeadMutation();

  const leads = data?.data || [];
  const meta = data?.meta;

  const handleRespond = async (leadId: string) => {
    try {
      await respondToLead(leadId).unwrap();
    } catch { /* handled by RTK */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Leads</h1>
        {meta && <p className="text-sm text-text-muted mt-1">{meta.total} total leads</p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-border/50 rounded w-1/3 mb-2" />
              <div className="h-3 bg-border/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No leads yet. Publish and promote your listings to receive inquiries.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {lead.property?.cover_image?.thumbnail_url && (
                          <div className="w-12 h-9 rounded bg-border/50 overflow-hidden shrink-0">
                            <img src={lead.property.cover_image.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-text-primary font-medium truncate max-w-48">
                          {lead.property?.title || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary text-sm">{lead.user?.full_name || 'Anonymous'}</p>
                      {lead.user?.phone && (
                        <p className="text-xs text-text-muted">{lead.user.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        lead.contact_type === 'whatsapp' ? 'text-whatsapp' :
                        lead.contact_type === 'call' ? 'text-accent-dark' : 'text-text-secondary'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          lead.contact_type === 'whatsapp' ? 'bg-whatsapp' :
                          lead.contact_type === 'call' ? 'bg-accent-dark' : 'bg-text-muted'
                        }`} />
                        {lead.contact_type === 'whatsapp' ? 'WhatsApp' :
                         lead.contact_type === 'call' ? 'Phone Call' : 'Form'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                      {lead.source || '-'}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                      {formatRelativeTime(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {lead.responded_at ? (
                        <span className="text-xs text-success font-medium">
                          Responded {formatRelativeTime(lead.responded_at)}
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {lead.user?.phone && (
                            <a
                              href={`https://wa.me/${lead.user.phone.replace(/[^0-9+]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-whatsapp/10 text-whatsapp px-2.5 py-1 rounded-lg font-medium hover:bg-whatsapp/20"
                            >
                              Reply
                            </a>
                          )}
                          <button
                            onClick={() => handleRespond(lead.id)}
                            className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
                          >
                            Mark Done
                          </button>
                        </div>
                      )}
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
    </div>
  );
}
