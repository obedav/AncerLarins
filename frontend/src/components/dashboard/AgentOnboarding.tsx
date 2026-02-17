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

export default function AgentOnboarding({ user }: { user: User }) {
  const [dismissed, setDismissed] = useState(false);

  const completedSteps = STEPS.filter((step) => step.check(user));
  const completionPct = Math.round((completedSteps.length / STEPS.length) * 100);

  // Don't show if fully complete and dismissed, or if dismissed
  if (dismissed || completionPct === 100) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-6">
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
          <span className="text-text-secondary font-medium">{completionPct}% complete</span>
          <span className="text-text-muted">{completedSteps.length}/{STEPS.length} steps</span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-2.5">
          <div
            className="bg-accent-dark h-2.5 rounded-full transition-all"
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
                done ? 'bg-success/10' : 'bg-background hover:bg-accent/5'
              }`}
            >
              {/* Check/Circle icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-success' : 'border-2 border-border'
              }`}>
                {done && (
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
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
    <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">Profile Completeness</h3>
        <span className="text-sm font-bold text-accent-dark">{pct}%</span>
      </div>
      <div className="w-full bg-border/50 rounded-full h-2 mb-3">
        <div
          className="bg-accent-dark h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {emptyFields.map((f) => (
          <span key={f.label} className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-text-muted">
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
