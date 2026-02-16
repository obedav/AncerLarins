'use client';

import Link from 'next/link';
import { useGetAdminDashboardQuery } from '@/store/api/adminApi';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border/50 rounded w-1/4 animate-pulse" />
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

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Properties" value={stats?.total_properties ?? 0} />
        <MetricCard label="Total Agents" value={stats?.total_agents ?? 0} />
        <MetricCard label="Total Users" value={stats?.total_users ?? 0} />
        <MetricCard label="Leads This Week" value={stats?.leads_this_week ?? 0} color="text-accent-dark" />
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          href="/admin/properties"
          label="Pending Approvals"
          count={stats?.pending_approvals ?? 0}
          color="bg-yellow-500"
        />
        <ActionCard
          href="/admin/agents"
          label="Pending Agents"
          count={stats?.agents_by_verification?.pending ?? 0}
          color="bg-blue-500"
        />
        <ActionCard
          href="/admin/reports"
          label="Open Reports"
          count={stats?.open_reports ?? 0}
          color="bg-red-500"
        />
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Properties by Status</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
            {stats?.properties_by_status && Object.entries(stats.properties_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary capitalize">{status}</span>
                <span className="text-text-primary font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Agents by Verification</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
            {stats?.agents_by_verification && Object.entries(stats.agents_by_verification).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary capitalize">{status}</span>
                <span className="text-text-primary font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-text-muted mb-1">New Listings This Week</p>
          <p className="text-3xl font-bold text-text-primary">{stats?.new_listings_this_week ?? 0}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-text-muted mb-1">New Users This Week</p>
          <p className="text-3xl font-bold text-text-primary">{stats?.new_users_this_week ?? 0}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className={`text-3xl font-bold ${color || 'text-text-primary'}`}>{value.toLocaleString()}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function ActionCard({ href, label, count, color }: { href: string; label: string; count: number; color: string }) {
  return (
    <Link href={href} className="bg-surface border border-border rounded-xl p-5 hover:border-accent-dark/30 transition-colors block">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center`}>
          {count}
        </span>
      </div>
    </Link>
  );
}
