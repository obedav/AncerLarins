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
        {/* Skeleton banner */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 animate-pulse">
          <div className="h-7 bg-border/50 rounded w-1/3 mb-3" />
          <div className="h-4 bg-border/50 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-border/50 rounded-xl" />
              </div>
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

      {/* Gradient Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 sm:p-8">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back, {user?.first_name || 'Agent'}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Here&apos;s an overview of your activity and performance.
          </p>

          {/* Inline quick stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-white/80">
                <span className="font-semibold text-white">{Number(stats?.active_listings ?? 0)}</span> active listings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-whatsapp" />
              <span className="text-sm text-white/80">
                <span className="font-semibold text-white">{Number(stats?.total_leads ?? 0)}</span> leads this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-dark" />
              <span className="text-sm text-white/80">
                <span className="font-semibold text-white">{Number(stats?.total_views ?? 0)}</span> total views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Listings"
          value={Number(stats?.total_listings ?? 0)}
          icon="listings"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="Active Listings"
          value={Number(stats?.active_listings ?? 0)}
          icon="active"
          color="text-success"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
        <StatCard
          label="Leads (This Month)"
          value={Number(stats?.total_leads ?? 0)}
          icon="leads"
          color="text-accent-dark"
          iconBg="bg-accent-dark/10"
          iconColor="text-accent-dark"
        />
        <StatCard
          label="Total Views"
          value={Number(stats?.total_views ?? 0)}
          icon="views"
          color="text-accent-dark"
          iconBg="bg-accent/20"
          iconColor="text-accent-dark"
        />
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
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Leads</h2>
            <Link href="/dashboard/leads" className="text-sm text-accent-dark hover:underline">View all</Link>
          </div>
          {leads.length > 0 ? (
            <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border hover:border-accent-dark/20 transition-colors">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-border/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Lead type icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      lead.contact_type === 'whatsapp' ? 'bg-whatsapp/10' : 'bg-amber-100'
                    }`}>
                      {lead.contact_type === 'whatsapp' ? (
                        <svg className="w-4 h-4 text-whatsapp" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.293-.18-3.064.91.91-3.064-.18-.293A8 8 0 1112 20z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {lead.user?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {lead.property?.title} &middot; {formatRelativeTime(lead.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {lead.user?.phone && (
                      <a
                        href={`https://wa.me/${lead.user.phone.replace(/[^0-9+]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-whatsapp/10 text-whatsapp px-2.5 py-1 rounded-lg font-medium hover:bg-whatsapp/20 transition-colors"
                      >
                        Reply
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 text-center hover:border-accent-dark/20 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">No leads yet</p>
              <p className="text-xs text-text-muted">Publish listings to start receiving inquiries.</p>
            </div>
          )}
        </div>

        {/* Listing Status Breakdown */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Listing Breakdown</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4 hover:border-accent-dark/20 transition-colors">
            <StatusRow
              label="Approved"
              count={Number(stats?.active_listings ?? 0)}
              color="bg-success"
              total={Number(stats?.total_listings ?? 1)}
              icon={
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatusRow
              label="Pending"
              count={Number(stats?.pending_listings ?? 0)}
              color="bg-accent-dark"
              total={Number(stats?.total_listings ?? 1)}
              icon={
                <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatusRow
              label="Rejected"
              count={Number(stats?.rejected_listings ?? 0)}
              color="bg-error"
              total={Number(stats?.total_listings ?? 1)}
              icon={
                <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatusRow
              label="Draft"
              count={Number(stats?.draft_listings ?? 0)}
              color="bg-text-muted"
              total={Number(stats?.total_listings ?? 1)}
              icon={
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Recent Listings */}
      {properties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Listings</h2>
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
  const { user } = useAuth();
  const { data: savedData, isLoading } = useGetPropertiesQuery({ scope: 'saved', per_page: 6 });
  const savedProperties = savedData?.data || [];

  const quickActions = [
    {
      href: '/properties',
      title: 'Browse Properties',
      description: 'Explore listings across Lagos',
      iconBg: 'bg-primary/10',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
      ),
    },
    {
      href: '/dashboard/saved',
      title: 'Saved Searches',
      description: 'View your saved properties',
      iconBg: 'bg-accent-dark/10',
      icon: (
        <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/requests/new',
      title: 'Post Request',
      description: 'Tell agents what you need',
      iconBg: 'bg-success/10',
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/cooperatives',
      title: 'Cooperatives',
      description: 'Join a housing cooperative',
      iconBg: 'bg-amber-100',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Gradient Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 sm:p-8">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back, {user?.first_name || 'there'}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Your saved properties and activity at a glance.
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-surface border border-border rounded-xl p-4 hover:border-accent-dark/20 transition-colors"
            >
              <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                {action.icon}
              </div>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-dark transition-colors">{action.title}</h3>
              <p className="text-xs text-text-muted mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Saved Properties</h2>
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
          <div className="text-center py-16 bg-surface border border-border rounded-xl hover:border-accent-dark/20 transition-colors">
            {/* Icon circle */}
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">No saved properties yet</h3>
            <p className="text-xs text-text-muted mb-5">Browse listings and save the ones you love.</p>
            <Link href="/properties" className="bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: string;
  color?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    listings: (
      <svg className={`w-5 h-5 ${iconColor || 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    active: (
      <svg className={`w-5 h-5 ${iconColor || 'text-success'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    leads: (
      <svg className={`w-5 h-5 ${iconColor || 'text-accent-dark'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    views: (
      <svg className={`w-5 h-5 ${iconColor || 'text-accent-dark'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-accent-dark/20 transition-colors">
      <div className={`w-10 h-10 ${iconBg || 'bg-primary/10'} rounded-xl flex items-center justify-center mb-3`}>
        {icons[icon] || null}
      </div>
      <p className={`text-3xl font-bold ${color || 'text-text-primary'}`}>{value.toLocaleString()}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function StatusRow({
  label,
  count,
  color,
  total,
  icon,
}: {
  label: string;
  count: number;
  color: string;
  total: number;
  icon?: React.ReactNode;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="flex items-center gap-2 text-text-secondary">
          {icon}
          {label}
        </span>
        <span className="text-text-primary font-semibold">{count}</span>
      </div>
      <div className="w-full bg-border/30 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
