'use client';

import type { SubscriptionPlan } from '@/types/subscription';

function formatNaira(kobo: number): string {
  if (kobo === 0) return 'Free';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect?: (tier: string) => void;
  loading?: boolean;
}

export default function PricingCard({ plan, isCurrentPlan, onSelect, loading }: PricingCardProps) {
  const isPopular = plan.tier === 'pro';

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col ${
        isPopular
          ? 'border-accent-dark shadow-lg ring-2 ring-accent-dark/20'
          : 'border-border'
      } ${isCurrentPlan ? 'bg-accent/5' : 'bg-surface'}`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-dark text-primary text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      {isCurrentPlan && (
        <span className="absolute -top-3 right-4 bg-success text-white text-xs font-bold px-3 py-1 rounded-full">
          Current Plan
        </span>
      )}

      <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>

      <div className="mb-4">
        <span className="text-3xl font-bold text-text-primary">{formatNaira(plan.price_kobo)}</span>
        {plan.price_kobo > 0 && <span className="text-text-muted text-sm">/month</span>}
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <svg className="w-4 h-4 text-success mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {onSelect && !isCurrentPlan && plan.price_kobo > 0 && (
        <button
          onClick={() => onSelect(plan.tier)}
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
            isPopular
              ? 'bg-accent-dark text-primary hover:bg-accent'
              : 'bg-primary text-white hover:bg-primary-light'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : 'Upgrade'}
        </button>
      )}

      {isCurrentPlan && (
        <div className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-center bg-success/10 text-success">
          Active Plan
        </div>
      )}

      {plan.price_kobo === 0 && !isCurrentPlan && (
        <div className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-center bg-background text-text-muted">
          Default Plan
        </div>
      )}
    </div>
  );
}
