'use client';

import { useGetAreaTrendsQuery } from '@/store/api/locationApi';
import { formatPrice, formatPriceShort } from '@/lib/utils';
import type { ListingType } from '@/types';

function getMarketTemperature(avgDays: number, totalListings: number): { label: string; color: string; bg: string } {
  if (avgDays < 30 && totalListings > 5) return { label: 'Hot', color: 'text-error', bg: 'bg-error/10' };
  if (avgDays < 60) return { label: 'Warm', color: 'text-accent-dark', bg: 'bg-accent/15' };
  return { label: 'Cool', color: 'text-text-secondary', bg: 'bg-border/50' };
}

export default function MarketTrends({ areaId, areaName, listingType }: { areaId: string; areaName: string; listingType: ListingType }) {
  const { data, isLoading } = useGetAreaTrendsQuery({ areaId, listingType });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
        <div className="h-6 bg-border/50 rounded w-1/3 mb-4" />
        <div className="h-32 bg-border/50 rounded" />
      </div>
    );
  }

  const response = data?.data;
  const trends = response?.trends ?? [];
  const stats = response?.stats ?? { total_listings: 0, avg_price_kobo: 0, median_price_kobo: 0, avg_days_on_market: 0, city_comparison: null };
  const temp = getMarketTemperature(stats.avg_days_on_market, stats.total_listings);

  // Calculate max price for bar chart scaling
  const maxPrice = trends.length > 0
    ? Math.max(...trends.map((t) => t.avg_price_kobo))
    : 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Market Trends</h2>
          <p className="text-xs text-text-muted">{areaName} area &middot; {listingType === 'sale' ? 'For Sale' : 'For Rent'}</p>
        </div>
        {stats.total_listings > 0 && (
          <span className={`${temp.bg} ${temp.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
            Market is {temp.label}
          </span>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-background rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted">Avg Price</p>
          <p className="text-sm font-bold text-text-primary">
            {stats.avg_price_kobo > 0 ? formatPriceShort(stats.avg_price_kobo) : '-'}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted">Listings</p>
          <p className="text-sm font-bold text-text-primary">{stats.total_listings || '-'}</p>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted">Avg Days on Market</p>
          <p className="text-sm font-bold text-text-primary">{stats.avg_days_on_market || '-'}</p>
        </div>
      </div>

      {/* City Comparison */}
      {stats.city_comparison && (
        <div className={`mb-5 px-3 py-2 rounded-lg text-sm ${
          stats.city_comparison.direction === 'above' ? 'bg-accent/10 text-accent-dark' : 'bg-success/10 text-success'
        }`}>
          Prices in {areaName} are {stats.city_comparison.label}
        </div>
      )}

      {/* CSS Bar Chart */}
      {trends.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">6-Month Price Trend</h3>
          <div className="flex items-end gap-2 h-32">
            {trends.map((t, i) => {
              const height = maxPrice > 0 ? (t.avg_price_kobo / maxPrice) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-text-muted font-medium">{formatPriceShort(t.avg_price_kobo)}</span>
                  <div
                    className="w-full bg-accent-dark/70 rounded-t-md transition-all hover:bg-accent-dark"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${t.month}: ${formatPrice(t.avg_price_kobo)} (${t.listing_count} listings)`}
                  />
                  <span className="text-xs text-text-muted">{t.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-dark/10 mb-3">
            <svg className="w-6 h-6 text-accent-dark/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary font-medium">No price trend data yet</p>
          <p className="text-xs text-text-muted mt-1">Trends will appear as more properties are listed in {areaName}</p>
        </div>
      )}
    </div>
  );
}
