'use client';

import { useState } from 'react';
import { useGetAdminUsersQuery, useBanUserMutation, useUnbanUserMutation } from '@/store/api/adminApi';
import { formatDate } from '@/lib/utils';

const ROLE_TABS = [
  { value: '', label: 'All' },
  { value: 'user', label: 'Users' },
  { value: 'agent', label: 'Agents' },
  { value: 'admin', label: 'Admins' },
];

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminUsersQuery({
    role: roleFilter || undefined,
    page,
    per_page: 20,
  });
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();

  const [banModal, setBanModal] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');

  const users = data?.data || [];
  const meta = data?.meta;

  const handleBan = async () => {
    if (!banModal || !banReason.trim()) return;
    try {
      await banUser({ user_id: banModal, ban_reason: banReason }).unwrap();
      setBanModal(null);
      setBanReason('');
    } catch { /* RTK */ }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser({ user_id: userId }).unwrap();
    } catch { /* RTK */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">User Management</h1>

      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setRoleFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === tab.value ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
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
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No users match this filter.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">User</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark text-sm font-bold">
                            {user.first_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-text-primary font-medium">{user.full_name}</p>
                          {user.email && <p className="text-xs text-text-muted">{user.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                        user.role === 'admin' || user.role === 'super_admin'
                          ? 'bg-primary/10 text-primary'
                          : user.role === 'agent'
                          ? 'bg-accent/15 text-accent-dark'
                          : 'bg-border/50 text-text-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                        user.status === 'active' ? 'bg-success/10 text-success' :
                        user.status === 'banned' ? 'bg-error/10 text-error' :
                        user.status === 'suspended' ? 'bg-accent/20 text-accent-dark' :
                        'bg-border/50 text-text-muted'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.status === 'banned' ? (
                        <button onClick={() => handleUnban(user.id)} className="text-xs text-success hover:text-success/80 font-medium px-2 py-1">
                          Unban
                        </button>
                      ) : user.role !== 'admin' && user.role !== 'super_admin' ? (
                        <button onClick={() => setBanModal(user.id)} className="text-xs text-error hover:bg-error/5 px-2 py-1 rounded font-medium">
                          Ban
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page} ({meta.total} total)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full border border-border">
            <h3 className="font-semibold text-text-primary mb-4">Ban User</h3>
            <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for ban..." rows={3} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setBanModal(null); setBanReason(''); }} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
              <button onClick={handleBan} disabled={!banReason.trim()} className="px-4 py-2 rounded-xl bg-error text-white text-sm font-medium disabled:opacity-50">Ban User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
