'use client';

import type { CurrentSubscription } from '@/types/subscription';

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

interface SubscriptionStatusProps {
  subscription: CurrentSubscription;
}

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const tierLabel = subscription.tier?.toString().charAt(0).toUpperCase() +
    (subscription.tier?.toString().slice(1) || '');
  const usagePercent = subscription.max_listings > 0
    ? Math.min(100, (subscription.active_listings / subscription.max_listings) * 100)
    : 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Current Plan</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          subscription.has_active
            ? 'bg-success/15 text-success'
            : 'bg-text-muted/15 text-text-muted'
        }`}>
          {subscription.has_active ? 'Active' : 'Free'}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold text-text-primary">{tierLabel}</p>
        {subscription.subscription && (
          <p className="text-sm text-text-secondary mt-1">
            {subscription.subscription.days_remaining} days remaining
            {' '}&middot;{' '}
            Renews {new Date(subscription.subscription.ends_at).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Listing quota gauge */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">Listing Quota</span>
          <span className="text-text-primary font-medium">
            {subscription.active_listings} / {subscription.max_listings >= 9999 ? 'Unlimited' : subscription.max_listings}
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 80 ? 'bg-error' : usagePercent > 50 ? 'bg-accent-dark' : 'bg-success'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {subscription.subscription && (
        <div className="pt-3 border-t border-border text-sm text-text-muted space-y-1">
          <p>Last payment: {formatNaira(subscription.subscription.amount_kobo)}</p>
          <p>Reference: {subscription.subscription.payment_reference}</p>
        </div>
      )}
    </div>
  );
}
