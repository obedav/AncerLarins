'use client';

import { useState } from 'react';
import { useGetPropertyRequestsQuery } from '@/store/api/requestApi';
import RequestCard from '@/components/requests/RequestCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const LISTING_TABS = [
  { value: '', label: 'All' },
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Buy' },
  { value: 'short_let', label: 'Short Let' },
];

export default function RequestsPage() {
  const [listingType, setListingType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPropertyRequestsQuery({
    ...(listingType && { listing_type: listingType }),
    page,
    per_page: 15,
  });

  const requests = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary py-10 md:py-14">
          <div className="container-app">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Property Requests</h1>
            <p className="text-white/60 max-w-2xl">
              People are looking for properties. Browse requests and respond with your listings.
            </p>
          </div>
        </div>

        <div className="container-app py-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {LISTING_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setListingType(tab.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  listingType === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-background'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border animate-pulse p-5">
                  <div className="h-5 bg-border/50 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-border/50 rounded w-full mb-2" />
                  <div className="h-4 bg-border/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <p className="text-text-muted text-lg mb-2">No requests found.</p>
              <p className="text-text-muted text-sm">Check back later or post your own request.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-text-muted">
                    Page {meta.current_page} of {meta.last_page}
                  </p>
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
