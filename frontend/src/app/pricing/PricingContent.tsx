'use client';

import { useGetPlansQuery } from '@/store/api/subscriptionApi';
import PricingCard from '@/components/billing/PricingCard';
import Link from 'next/link';

export default function PricingContent() {
  const { data, isLoading } = useGetPlansQuery();
  const plans = data?.data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-border rounded w-1/2 mb-4" />
            <div className="h-10 bg-border rounded w-2/3 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-border rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PricingCard key={plan.tier} plan={plan} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-text-secondary mb-4">
          Ready to list your properties on Lagos&apos;s premium real estate platform?
        </p>
        <Link
          href="/register"
          className="inline-block bg-accent-dark text-primary px-8 py-3 rounded-xl font-medium hover:bg-accent transition-colors"
        >
          Get Started as an Agent
        </Link>
      </div>
    </>
  );
}
