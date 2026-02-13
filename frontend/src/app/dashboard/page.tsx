'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import { useGetAgentDashboardQuery, useGetAgentLeadsQuery } from '@/store/api/agentApi';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAgent = user.role === 'agent';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="bg-primary py-8">
          <div className="container-app">
            <div className="flex items-center gap-4">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-accent/30" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                  {user.first_name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{user.full_name}</h1>
                <p className="text-white/60 text-sm capitalize">{user.role}{user.email ? ` · ${user.email}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-app py-8">
          {isAgent ? <AgentDashboard /> : <UserDashboard />}
        </div>
      </main>
      <Footer />
    </>
  );
}

function AgentDashboard() {
  const { data: dashData, isLoading: dashLoading } = useGetAgentDashboardQuery();
  const { data: leadsData } = useGetAgentLeadsQuery({ per_page: 5 });
  const { data: myProps } = useGetPropertiesQuery({ scope: 'mine', per_page: 6 });

  const stats = dashData?.data;
  const leads = leadsData?.data || [];
  const properties = myProps?.data || [];

  if (dashLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="h-8 bg-border/50 rounded w-1/2 mb-2" />
            <div className="h-4 bg-border/50 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={Number(stats?.total_listings ?? 0)} />
        <StatCard label="Active Listings" value={Number(stats?.active_listings ?? 0)} color="text-green-600" />
        <StatCard label="Total Views" value={Number(stats?.total_views ?? 0)} color="text-blue-600" />
        <StatCard label="Total Leads" value={Number(stats?.total_leads ?? 0)} color="text-accent-dark" />
      </div>

      {/* Quick Actions */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-2">List a New Property</h3>
        <p className="text-sm text-text-muted mb-4">
          Reach thousands of buyers and tenants across Lagos.
        </p>
        <Link
          href="/properties/new"
          className="inline-block bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Add New Property
        </Link>
      </div>

      {/* Recent Leads */}
      {leads.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Leads</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {leads.map((lead) => (
                <div key={lead.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {lead.user?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {lead.property?.title} · {lead.contact_type} · {formatRelativeTime(lead.created_at)}
                    </p>
                  </div>
                  {lead.user?.phone && (
                    <a
                      href={`https://wa.me/${lead.user.phone.replace(/[^0-9+]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-whatsapp/10 text-whatsapp px-3 py-1.5 rounded-lg font-medium hover:bg-whatsapp/20 transition-colors"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Properties */}
      {properties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">My Listings</h2>
            <Link href="/properties?scope=mine" className="text-sm text-accent-dark font-medium hover:underline">
              View all
            </Link>
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

function UserDashboard() {
  const { data: savedData, isLoading } = useGetPropertiesQuery({ scope: 'saved', per_page: 6 });
  const savedProperties = savedData?.data || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Saved Properties" value={savedProperties.length} />
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-center">
          <Link
            href="/properties"
            className="text-accent-dark font-medium hover:underline text-sm"
          >
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Saved Properties */}
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
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h3 className="text-text-primary font-semibold mb-1">No saved properties</h3>
            <p className="text-text-muted text-sm mb-4">Save properties you like to view them here later.</p>
            <Link
              href="/properties"
              className="inline-block bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <p className={`text-3xl font-bold ${color || 'text-text-primary'}`}>{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}
