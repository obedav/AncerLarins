'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGetAdminDashboardQuery } from '@/store/api/adminApi';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetAdminDashboardQuery();
  const stats = data?.data;
  const isSuperAdmin = user?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-8 bg-border/50 rounded w-1/2 mb-2" />
              <div className="h-4 bg-border/50 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pendingApprovals = stats?.pending_approvals ?? 0;
  const pendingAgents = stats?.agents_by_verification?.pending ?? 0;
  const openReports = stats?.open_reports ?? 0;
  const totalAlerts = pendingApprovals + pendingAgents + openReports;

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1">
            {getGreeting()},
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {user?.first_name ?? 'Admin'}
          </h1>
          <p className="text-white/70 text-sm max-w-md">
            {totalAlerts > 0
              ? `You have ${totalAlerts} item${totalAlerts !== 1 ? 's' : ''} that need${totalAlerts === 1 ? 's' : ''} your attention today.`
              : 'Everything looks good. No pending items require attention.'}
          </p>
          {isSuperAdmin && (
            <span className="inline-block mt-3 text-xs bg-white/15 text-white/90 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
              Super Admin
            </span>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full bg-white/5" />
      </div>

      {/* Attention Required */}
      {totalAlerts > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Needs Attention</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AlertCard
              href="/admin/properties"
              label="Pending Properties"
              count={pendingApprovals}
              icon={<PropertyIcon />}
              color="amber"
            />
            <AlertCard
              href="/admin/agents"
              label="Pending Agents"
              count={pendingAgents}
              icon={<AgentIcon />}
              color="blue"
            />
            <AlertCard
              href="/admin/reports"
              label="Open Reports"
              count={openReports}
              icon={<ReportIcon />}
              color="red"
            />
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Properties"
            value={stats?.total_properties ?? 0}
            icon={<PropertyIcon />}
            trend={stats?.new_listings_this_week ?? 0}
            trendLabel="this week"
          />
          <StatCard
            label="Total Agents"
            value={stats?.total_agents ?? 0}
            icon={<AgentIcon />}
          />
          <StatCard
            label="Total Users"
            value={stats?.total_users ?? 0}
            icon={<UsersIcon />}
            trend={stats?.new_users_this_week ?? 0}
            trendLabel="this week"
          />
          <StatCard
            label="Total Leads"
            value={stats?.total_leads ?? 0}
            icon={<LeadsIcon />}
            trend={stats?.leads_this_week ?? 0}
            trendLabel="this week"
          />
        </div>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Properties by Status</h2>
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            {stats?.properties_by_status && Object.entries(stats.properties_by_status).length > 0 ? (
              Object.entries(stats.properties_by_status).map(([status, count]) => {
                const total = stats.total_properties || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-text-primary font-semibold">{(count as number).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getStatusBarColor(status)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No property data yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Agents by Verification</h2>
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            {stats?.agents_by_verification && Object.entries(stats.agents_by_verification).length > 0 ? (
              Object.entries(stats.agents_by_verification).map(([status, count]) => {
                const total = stats.total_agents || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-text-primary font-semibold">{(count as number).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getVerificationBarColor(status)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No agent data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <QuickAction href="/admin/properties" label="Manage Properties" icon={<PropertyIcon />} />
          <QuickAction href="/admin/agents" label="Manage Agents" icon={<AgentIcon />} />
          <QuickAction href="/admin/users" label="Manage Users" icon={<UsersIcon />} />
          <QuickAction href="/admin/inquiries" label="View Inquiries" icon={<LeadsIcon />} />
          <QuickAction href="/admin/reports" label="View Reports" icon={<ReportIcon />} />
          <QuickAction href="/admin/activity" label="Activity Logs" icon={<ActivityIcon />} />
          {isSuperAdmin && (
            <>
              <QuickAction href="/admin/team" label="Admin Team" icon={<ShieldIcon />} />
              <QuickAction href="/admin/settings" label="System Settings" icon={<SettingsIcon />} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatusBarColor(status: string): string {
  switch (status) {
    case 'approved': return 'bg-success';
    case 'pending': return 'bg-accent-dark';
    case 'rejected': return 'bg-error';
    case 'draft': return 'bg-border';
    default: return 'bg-primary';
  }
}

function getVerificationBarColor(status: string): string {
  switch (status) {
    case 'verified': return 'bg-success';
    case 'pending': return 'bg-accent-dark';
    case 'rejected': return 'bg-error';
    case 'unverified': return 'bg-border';
    default: return 'bg-primary';
  }
}

// ── Components ───────────────────────────────────────────

function StatCard({ label, value, icon, trend, trendLabel }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 group hover:border-accent-dark/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-text-primary">{value.toLocaleString()}</p>
      <p className="text-sm text-text-muted mt-0.5">{label}</p>
      {trend !== undefined && trend > 0 && (
        <p className="text-xs text-success font-medium mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          +{trend} {trendLabel}
        </p>
      )}
    </div>
  );
}

function AlertCard({ href, label, count, icon, color }: {
  href: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  color: 'amber' | 'blue' | 'red';
}) {
  if (count === 0) return null;

  const colorMap = {
    amber: { bg: 'bg-accent-dark/10', text: 'text-accent-dark', badge: 'bg-accent-dark' },
    blue: { bg: 'bg-primary/10', text: 'text-primary', badge: 'bg-primary' },
    red: { bg: 'bg-error/10', text: 'text-error', badge: 'bg-error' },
  };
  const c = colorMap[color];

  return (
    <Link href={href} className={`${c.bg} rounded-xl p-4 flex items-center gap-3 hover:opacity-80 transition-opacity`}>
      <div className={`${c.text} shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.text}`}>{label}</p>
      </div>
      <span className={`${c.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center`}>
        {count}
      </span>
    </Link>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 text-center hover:border-primary/30 hover:bg-primary/5 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
    </Link>
  );
}

// ── Icons ────────────────────────────────────────────────

function PropertyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
