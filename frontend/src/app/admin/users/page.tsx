'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  usePromoteToAdminMutation,
  useDemoteAdminMutation,
} from '@/store/api/adminApi';
import { formatDate } from '@/lib/utils';

const ROLE_TABS = [
  { value: '', label: 'All' },
  { value: 'user', label: 'Users' },
  { value: 'agent', label: 'Agents' },
  { value: 'admin', label: 'Admins' },
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminUsersQuery({
    role: roleFilter || undefined,
    page,
    per_page: 20,
  });
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [promoteToAdmin, { isLoading: promoting }] = usePromoteToAdminMutation();
  const [demoteAdmin, { isLoading: demoting }] = useDemoteAdminMutation();

  const [banModal, setBanModal] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [promoteModal, setPromoteModal] = useState<string | null>(null);
  const [demoteModal, setDemoteModal] = useState<string | null>(null);

  const users = data?.data || [];
  const meta = data?.meta;

  const totalUsers = meta?.total ?? users.length;
  const activeCount = users.filter((u) => !u.status || u.status === 'active').length;
  const bannedCount = users.filter((u) => u.status === 'banned').length;
  const agentCount = users.filter((u) => u.role === 'agent').length;

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

  const handlePromote = async () => {
    if (!promoteModal) return;
    try {
      await promoteToAdmin({ user_id: promoteModal }).unwrap();
      setPromoteModal(null);
    } catch { /* RTK */ }
  };

  const handleDemote = async () => {
    if (!demoteModal) return;
    try {
      await demoteAdmin({ user_id: demoteModal }).unwrap();
      setDemoteModal(null);
    } catch { /* RTK */ }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active',
      value: activeCount,
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Banned',
      value: bannedCount,
      icon: (
        <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      label: 'Agents',
      value: agentCount,
      icon: (
        <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      color: 'text-accent-dark',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-muted">{totalUsers} registered user{totalUsers !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-4 hover:border-accent-dark/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Segmented Tabs */}
      <div className="bg-surface border border-border rounded-xl p-1 inline-flex gap-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setRoleFilter(tab.value); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-background/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        /* Skeleton matching table shape */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex gap-4">
            {['w-1/4', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6'].map((w, i) => (
              <div key={i} className={`h-3 bg-border/40 rounded ${w}`} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-border/50 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-border/40 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-border/40 rounded w-1/3" />
                <div className="h-2.5 bg-border/30 rounded w-1/5" />
              </div>
              <div className="h-3 bg-border/40 rounded w-16 hidden sm:block" />
              <div className="h-5 bg-border/40 rounded-full w-14" />
              <div className="h-5 bg-border/40 rounded-full w-14 hidden md:block" />
              <div className="h-3 bg-border/40 rounded w-20 hidden lg:block" />
              <div className="h-6 bg-border/40 rounded w-16" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl">
          <div className="w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No users found</h3>
          <p className="text-sm text-text-muted">No users match the current filter criteria.</p>
        </div>
      ) : (
        /* Enhanced Table */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/30">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      User
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      Phone
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                      Role
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      Status
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      Joined
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.full_name} width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" unoptimized />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/10 ring-2 ring-border flex items-center justify-center text-accent-dark text-sm font-bold">
                            {user.first_name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-text-primary font-medium truncate">{user.full_name}</p>
                          {user.email && <p className="text-xs text-text-muted truncate">{user.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium capitalize px-2.5 py-1 rounded-full ${
                        user.role === 'super_admin'
                          ? 'bg-primary/10 text-primary'
                          : user.role === 'admin'
                          ? 'bg-accent-dark/10 text-accent-dark'
                          : user.role === 'agent'
                          ? 'bg-accent/15 text-accent-dark'
                          : 'bg-border/50 text-text-secondary'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize px-2.5 py-1 rounded-full ${
                        user.status === 'active' ? 'bg-success/10 text-success' :
                        user.status === 'banned' ? 'bg-error/10 text-error' :
                        user.status === 'suspended' ? 'bg-accent/20 text-accent-dark' :
                        'bg-border/50 text-text-muted'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-success' :
                          user.status === 'banned' ? 'bg-error' :
                          user.status === 'suspended' ? 'bg-accent-dark' :
                          'bg-text-muted'
                        }`} />
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ban/Unban actions */}
                        {user.status === 'banned' ? (
                          <button onClick={() => handleUnban(user.id)} className="text-xs text-success hover:bg-success/10 font-medium px-2.5 py-1.5 rounded-lg transition-colors">
                            Unban
                          </button>
                        ) : user.role !== 'admin' && user.role !== 'super_admin' ? (
                          <button onClick={() => setBanModal(user.id)} className="text-xs text-error hover:bg-error/10 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            Ban
                          </button>
                        ) : null}

                        {/* Super admin: role management */}
                        {isSuperAdmin && user.role === 'user' && user.status !== 'banned' && (
                          <button onClick={() => setPromoteModal(user.id)} className="text-xs text-accent-dark hover:bg-accent/10 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            Promote
                          </button>
                        )}
                        {isSuperAdmin && user.role === 'admin' && user.id !== currentUser?.id && (
                          <button onClick={() => setDemoteModal(user.id)} className="text-xs text-error hover:bg-error/10 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            Demote
                          </button>
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
              <p className="text-xs text-text-muted">
                Page <span className="font-medium text-text-secondary">{meta.current_page}</span> of <span className="font-medium text-text-secondary">{meta.last_page}</span> ({meta.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-background/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                  disabled={page === meta.last_page}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-background/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-md w-full border border-border">
            {/* Centered icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-center text-lg mb-1">Ban User</h3>
            <p className="text-sm text-text-muted text-center mb-4">This action will immediately revoke the user&apos;s access.</p>

            {/* Warning callout */}
            <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3 mb-4">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-xs text-error/80">The user will be logged out of all sessions and unable to access their account until unbanned.</p>
              </div>
            </div>

            <label className="block text-sm font-medium text-text-secondary mb-1.5">Reason for ban</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Describe why this user is being banned..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error/50 transition-colors resize-none"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBan}
                disabled={!banReason.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-error text-white text-sm font-medium disabled:opacity-50 hover:bg-error/90 transition-colors"
              >
                Ban User
              </button>
              <button
                onClick={() => { setBanModal(null); setBanReason(''); }}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-background/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {promoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-md w-full border border-border">
            {/* Centered shield icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-accent-dark/10 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-center text-lg mb-1">Promote to Admin</h3>
            <p className="text-sm text-text-muted text-center mb-5">This user will gain access to the admin dashboard and all administrative features.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePromote}
                disabled={promoting}
                className="w-full px-4 py-2.5 rounded-xl bg-accent-dark text-white text-sm font-medium disabled:opacity-50 hover:bg-accent-dark/90 transition-colors"
              >
                {promoting ? 'Promoting...' : 'Promote to Admin'}
              </button>
              <button
                onClick={() => setPromoteModal(null)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-background/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demote Modal */}
      {demoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-md w-full border border-border">
            {/* Centered warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-center text-lg mb-1">Demote Admin</h3>
            <p className="text-sm text-text-muted text-center mb-4">This admin will lose all administrative privileges.</p>

            {/* Warning callout */}
            <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3 mb-5">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-xs text-error/80">Active admin sessions will be terminated and the user will lose access to the admin dashboard immediately.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDemote}
                disabled={demoting}
                className="w-full px-4 py-2.5 rounded-xl bg-error text-white text-sm font-medium disabled:opacity-50 hover:bg-error/90 transition-colors"
              >
                {demoting ? 'Demoting...' : 'Demote Admin'}
              </button>
              <button
                onClick={() => setDemoteModal(null)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-background/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
