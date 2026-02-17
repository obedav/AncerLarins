'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PropertyCard from '@/components/property/PropertyCard';
import AgentOnboarding from '@/components/dashboard/AgentOnboarding';
import { useGetAgentDashboardQuery, useGetAgentLeadsQuery } from '@/store/api/agentApi';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  return isAgent ? <AgentOverview /> : <UserOverview />;
}

function AgentOverview() {
  const { user } = useAuth();
  const { data: dashData, isLoading: dashLoading } = useGetAgentDashboardQuery();
  const { data: leadsData } = useGetAgentLeadsQuery({ per_page: 10 });
  const { data: myProps } = useGetPropertiesQuery({ scope: 'mine', per_page: 3 });

  const stats = dashData?.data;
  const leads = leadsData?.data || [];
  const properties = myProps?.data || [];

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      {/* Agent Onboarding Checklist */}
      {user && <AgentOnboarding user={user} />}

      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Welcome back. Here&apos;s an overview of your activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={Number(stats?.total_listings ?? 0)} icon="listings" />
        <StatCard label="Active Listings" value={Number(stats?.active_listings ?? 0)} icon="active" color="text-success" />
        <StatCard label="Leads (This Month)" value={Number(stats?.total_leads ?? 0)} icon="leads" color="text-accent-dark" />
        <StatCard label="Total Views" value={Number(stats?.total_views ?? 0)} icon="views" color="text-accent-dark" />
      </div>

      {/* Quick Action */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-text-primary">List a New Property</h3>
          <p className="text-sm text-text-muted">Reach thousands of buyers and tenants across Lagos.</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
        >
          + Add Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Leads</h2>
            <Link href="/dashboard/leads" className="text-sm text-accent-dark hover:underline">View all</Link>
          </div>
          {leads.length > 0 ? (
            <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {lead.user?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {lead.property?.title} &middot; {formatRelativeTime(lead.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`w-2 h-2 rounded-full ${lead.contact_type === 'whatsapp' ? 'bg-whatsapp' : 'bg-primary'}`} />
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-sm text-text-muted">No leads yet. Publish listings to start receiving inquiries.</p>
            </div>
          )}
        </div>

        {/* Listing Status Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Listing Breakdown</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
            <StatusRow label="Approved" count={Number(stats?.active_listings ?? 0)} color="bg-success" total={Number(stats?.total_listings ?? 1)} />
            <StatusRow label="Pending" count={Number(stats?.pending_listings ?? 0)} color="bg-accent-dark" total={Number(stats?.total_listings ?? 1)} />
            <StatusRow label="Rejected" count={Number(stats?.rejected_listings ?? 0)} color="bg-error" total={Number(stats?.total_listings ?? 1)} />
            <StatusRow label="Draft" count={Number(stats?.draft_listings ?? 0)} color="bg-text-muted" total={Number(stats?.total_listings ?? 1)} />
          </div>
        </div>
      </div>

      {/* Recent Listings */}
      {properties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-accent-dark hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserOverview() {
  const { data: savedData, isLoading } = useGetPropertiesQuery({ scope: 'saved', per_page: 6 });
  const savedProperties = savedData?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-text-primary">My Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your saved properties and activity.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Saved Properties</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border animate-pulse">
                <div className="h-48 bg-border/50 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-border/50 rounded w-1/2" />
                  <div className="h-4 bg-border/50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-border rounded-xl">
            <p className="text-text-muted mb-4">No saved properties yet.</p>
            <Link href="/properties" className="bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className={`text-3xl font-bold ${color || 'text-text-primary'}`}>{value.toLocaleString()}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function StatusRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-medium">{count}</span>
      </div>
      <div className="w-full bg-border/50 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
