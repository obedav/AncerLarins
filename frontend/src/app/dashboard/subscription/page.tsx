'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useGetPlansQuery, useGetCurrentSubscriptionQuery, useInitializeSubscriptionMutation, useVerifyPaymentMutation } from '@/store/api/subscriptionApi';
import PricingCard from '@/components/billing/PricingCard';
import SubscriptionStatus from '@/components/billing/SubscriptionStatus';

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export default function SubscriptionPage() {
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const { data: currentData, isLoading: currentLoading, refetch } = useGetCurrentSubscriptionQuery();
  const [initializeSubscription] = useInitializeSubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const plans = plansData?.data || [];
  const current = currentData?.data;

  const handleUpgrade = async (tier: string) => {
    setProcessingTier(tier);
    setMessage(null);

    try {
      const result = await initializeSubscription({ tier }).unwrap();
      const paymentData = result.data;

      if (!paymentData || !window.PaystackPop) {
        setMessage({ type: 'error', text: 'Payment system not available. Please try again.' });
        setProcessingTier(null);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        ref: paymentData.reference,
        onSuccess: async (transaction: { reference: string }) => {
          try {
            await verifyPayment({ reference: transaction.reference }).unwrap();
            setMessage({ type: 'success', text: 'Subscription activated successfully!' });
            refetch();
          } catch {
            setMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
          }
          setProcessingTier(null);
        },
        onClose: () => {
          setProcessingTier(null);
        },
      });

      handler.openIframe();
    } catch {
      setMessage({ type: 'error', text: 'Failed to initialize payment. Please try again.' });
      setProcessingTier(null);
    }
  };

  if (plansLoading || currentLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-border rounded w-1/3 mb-4" />
          <div className="h-10 bg-border rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscription</h1>
          <p className="text-text-secondary mt-1">Manage your plan and billing</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {message.text}
          </div>
        )}

        {current && <SubscriptionStatus subscription={current} />}

        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">
            {current?.has_active ? 'Change Plan' : 'Upgrade Your Plan'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.tier}
                plan={plan}
                isCurrentPlan={current?.tier?.toString() === plan.tier}
                onSelect={handleUpgrade}
                loading={processingTier === plan.tier}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
