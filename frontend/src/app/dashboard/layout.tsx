'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import NotificationBell from '@/components/dashboard/NotificationBell';
import PushNotificationSetup from '@/components/dashboard/PushNotificationSetup';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-primary border-b border-primary-light/10">
        <div className="container-app flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-accent">Ancer</span>
            <span className="text-lg font-bold text-white">Larins</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/60 hover:text-white text-sm">
              View Site
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                  {user.first_name.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm text-white font-medium leading-tight">{user.full_name}</p>
                <p className="text-xs text-white/40 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-white/40 hover:text-white text-sm ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-6">
              <DashboardSidebar />
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden w-full mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <Link href="/dashboard" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Overview</Link>
              <Link href="/dashboard/listings" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Listings</Link>
              <Link href="/dashboard/leads" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Leads</Link>
              <Link href="/dashboard/saved-searches" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Saved</Link>
              <Link href="/dashboard/notifications" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Notifications</Link>
              <Link href="/dashboard/profile" className="shrink-0 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary">Profile</Link>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      <PushNotificationSetup />
    </div>
  );
}
