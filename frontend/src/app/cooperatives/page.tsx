'use client';

import { useState } from 'react';
import { useGetCooperativesQuery } from '@/store/api/cooperativeApi';
import CooperativeCard from '@/components/cooperatives/CooperativeCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CooperativesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetCooperativesQuery({ page, per_page: 15 });

  const cooperatives = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="bg-primary py-10 md:py-14">
          <div className="container-app">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Property Cooperatives</h1>
            <p className="text-white/60 max-w-2xl">
              Pool resources with others to acquire property. Join a cooperative or start your own.
            </p>
          </div>
        </div>

        <div className="container-app py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border animate-pulse p-5">
                  <div className="h-5 bg-border/50 rounded w-3/4 mb-3" />
                  <div className="h-2 bg-border/50 rounded w-full mb-2" />
                  <div className="h-4 bg-border/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : cooperatives.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <p className="text-text-muted text-lg mb-2">No cooperatives yet.</p>
              <p className="text-text-muted text-sm">Be the first to start one from your dashboard!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cooperatives.map((coop) => (
                  <CooperativeCard key={coop.id} cooperative={coop} />
                ))}
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= (meta.last_page || 1)}
                      className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
