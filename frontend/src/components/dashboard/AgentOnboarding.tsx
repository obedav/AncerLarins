'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@/types';

interface OnboardingStep {
  key: string;
  label: string;
  description: string;
  href: string;
  check: (user: User) => boolean;
}

const STEPS: OnboardingStep[] = [
  {
    key: 'profile',
    label: 'Complete your profile',
    description: 'Add your company name, bio, and contact details',
    href: '/dashboard/profile',
    check: (u) => !!(u.agent_profile?.company_name && u.agent_profile?.bio),
  },
  {
    key: 'photo',
    label: 'Add a profile photo',
    description: 'Properties with agent photos get 30% more inquiries',
    href: '/dashboard/profile',
    check: (u) => !!u.avatar_url,
  },
  {
    key: 'verify',
    label: 'Verify your identity',
    description: 'Get a verified badge and boost your credibility',
    href: '/dashboard/profile',
    check: (u) => u.agent_profile?.verification_status === 'verified' || u.agent_profile?.verification_status === 'pending',
  },
  {
    key: 'listing',
    label: 'List your first property',
    description: 'Start reaching thousands of buyers and tenants',
    href: '/dashboard/listings/new',
    check: (u) => (u.agent_profile?.total_listings ?? 0) > 0,
  },
  {
    key: 'lead',
    label: 'Get your first lead',
    description: 'Respond quickly to boost your response rate',
    href: '/dashboard/leads',
    check: (u) => (u.agent_profile?.total_leads ?? 0) > 0,
  },
];

function StepIcon({ stepKey, done }: { stepKey: string; done: boolean }) {
  const colorClass = done ? 'text-success' : 'text-accent-dark';
  const iconProps = { className: `w-3.5 h-3.5 ${colorClass}`, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.5 };

  switch (stepKey) {
    case 'profile':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case 'photo':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      );
    case 'verify':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case 'listing':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
    case 'lead':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AgentOnboarding({ user }: { user: User }) {
  const [dismissed, setDismissed] = useState(false);

  const completedSteps = STEPS.filter((step) => step.check(user));
  const completionPct = Math.round((completedSteps.length / STEPS.length) * 100);

  // Don't show if fully complete and dismissed, or if dismissed
  if (dismissed || completionPct === 100) return null;

  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent-dark/5 border border-accent/20 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-text-primary">Get Started as an Agent</h2>
          <p className="text-sm text-text-muted mt-0.5">Complete these steps to maximize your listing visibility</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-secondary p-1"
          aria-label="Dismiss onboarding"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-medium">{completionPct}% complete</span>
            {completionPct >= 80 && (
              <span className="text-accent-dark font-semibold text-xs animate-pulse">
                Almost there!
              </span>
            )}
          </div>
          <span className="text-text-muted">{completedSteps.length}/{STEPS.length} steps</span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-3">
          <div
            className="bg-accent-dark h-3 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done = step.check(user);
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                done ? 'bg-success/10' : 'bg-background/80 hover:bg-accent/5'
              }`}
            >
              {/* Check/Circle icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-success' : 'border-2 border-accent/30 bg-accent/5'
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <StepIcon stepKey={step.key} done={false} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${done ? 'text-success line-through' : 'text-text-primary'}`}>
                  {step.label}
                </p>
                {!done && <p className="text-xs text-text-muted">{step.description}</p>}
              </div>
              {!done && (
                <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileCompleteness({ user }: { user: User }) {
  const profile = user.agent_profile;
  if (!profile) return null;

  const fields = [
    { label: 'Company Name', filled: !!profile.company_name },
    { label: 'Bio', filled: !!profile.bio },
    { label: 'WhatsApp Number', filled: !!profile.whatsapp_number },
    { label: 'Office Address', filled: !!profile.office_address },
    { label: 'Specializations', filled: !!(profile.specializations && profile.specializations.length > 0) },
    { label: 'Years of Experience', filled: !!profile.years_experience },
    { label: 'Profile Photo', filled: !!user.avatar_url },
    { label: 'Verification', filled: profile.verification_status === 'verified' || profile.verification_status === 'pending' },
  ];

  const filledCount = fields.filter((f) => f.filled).length;
  const pct = Math.round((filledCount / fields.length) * 100);

  if (pct === 100) return null;

  const emptyFields = fields.filter((f) => !f.filled);

  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent-dark/5 border border-accent/20 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">Profile Completeness</h3>
        <span className="text-sm font-bold text-accent-dark">{pct}%</span>
      </div>
      <div className="w-full bg-border/50 rounded-full h-3 mb-3">
        <div
          className="bg-accent-dark h-3 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {emptyFields.map((f) => (
          <span key={f.label} className="text-xs bg-background/80 border border-accent/15 rounded-lg px-2 py-1 text-text-muted">
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
