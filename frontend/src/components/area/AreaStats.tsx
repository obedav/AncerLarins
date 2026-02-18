'use client';

import { formatPriceShort } from '@/lib/utils';

interface AreaStatsProps {
  area: {
    name: string;
    avg_rent_1br: number | null;
    avg_rent_2br: number | null;
    avg_rent_3br: number | null;
    avg_buy_price_sqm: number | null;
    safety_score: number | null;
  };
  listingType: 'rent' | 'sale';
}

export default function AreaStats({ area, listingType }: AreaStatsProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        {area.name} Price Overview
      </h2>

      {listingType === 'rent' ? (
        <div className="space-y-3">
          {area.avg_rent_1br && (
            <div className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
              <span className="text-sm text-text-muted">1 Bedroom</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatPriceShort(area.avg_rent_1br)}/yr
              </span>
            </div>
          )}
          {area.avg_rent_2br && (
            <div className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
              <span className="text-sm text-text-muted">2 Bedrooms</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatPriceShort(area.avg_rent_2br)}/yr
              </span>
            </div>
          )}
          {area.avg_rent_3br && (
            <div className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
              <span className="text-sm text-text-muted">3 Bedrooms</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatPriceShort(area.avg_rent_3br)}/yr
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {area.avg_buy_price_sqm && (
            <div className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
              <span className="text-sm text-text-muted">Avg. Price per sqm</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatPriceShort(area.avg_buy_price_sqm)}
              </span>
            </div>
          )}
        </div>
      )}

      {area.safety_score !== null && area.safety_score > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Safety Score</span>
            <span className="text-sm font-semibold text-text-primary">{area.safety_score}/10</span>
          </div>
          <div className="w-full bg-border/50 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(area.safety_score / 10) * 100}%`,
                backgroundColor: area.safety_score >= 7 ? 'var(--color-success)' : area.safety_score >= 5 ? 'var(--color-accent-dark)' : 'var(--color-error)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
