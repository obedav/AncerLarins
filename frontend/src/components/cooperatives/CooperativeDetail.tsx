'use client';

import { useState } from 'react';
import { useGetCooperativeQuery, useJoinCooperativeMutation, useContributeToCooperativeMutation } from '@/store/api/cooperativeApi';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

function formatPrice(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" className="text-border" strokeWidth="8" />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke="currentColor" className="text-accent"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
        <span className="block text-xs text-text-muted">funded</span>
      </div>
    </div>
  );
}

export default function CooperativeDetail({ id }: { id: string }) {
  const { data, isLoading } = useGetCooperativeQuery(id);
  const { user, isAuthenticated } = useAuth();
  const [joinCooperative, { isLoading: joining }] = useJoinCooperativeMutation();
  const [contribute, { isLoading: contributing }] = useContributeToCooperativeMutation();

  const [contributeAmount, setContributeAmount] = useState('');
  const [showContribute, setShowContribute] = useState(false);
  const [error, setError] = useState('');

  const cooperative = data?.data;

  const isMember = cooperative?.members?.some((m) => m.user?.id === user?.id);
  const isAdmin = cooperative?.admin_user?.id === user?.id;

  const handleJoin = async () => {
    setError('');
    try {
      await joinCooperative(id).unwrap();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to join.');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amountKobo = Number(contributeAmount) * 100;
    if (!amountKobo || amountKobo < 100) {
      setError('Minimum contribution is ₦1.');
      return;
    }
    try {
      const result = await contribute({ cooperativeId: id, amount_kobo: amountKobo }).unwrap();
      if (result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      }
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to initialize payment.');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="container-app py-10">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-border/50 rounded w-1/2" />
              <div className="h-40 bg-border/50 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!cooperative) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Cooperative not found</h1>
            <Link href="/cooperatives" className="text-accent hover:underline">Browse cooperatives</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container-app py-8 md:py-10">
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/cooperatives" className="hover:text-accent transition-colors">Cooperatives</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{cooperative.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">{cooperative.name}</h1>
                {cooperative.description && (
                  <p className="text-text-secondary whitespace-pre-wrap mb-4">{cooperative.description}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted">Target</p>
                    <p className="font-semibold text-text-primary">{formatPrice(cooperative.target_amount_kobo)}</p>
                  </div>
                  {cooperative.monthly_contribution_kobo && (
                    <div>
                      <p className="text-xs text-text-muted">Monthly</p>
                      <p className="font-semibold text-text-primary">{formatPrice(cooperative.monthly_contribution_kobo)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-muted">Members</p>
                    <p className="font-semibold text-text-primary">{cooperative.member_count}</p>
                  </div>
                  {cooperative.start_date && (
                    <div>
                      <p className="text-xs text-text-muted">Start Date</p>
                      <p className="font-medium text-text-primary">{new Date(cooperative.start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {cooperative.target_date && (
                    <div>
                      <p className="text-xs text-text-muted">Target Date</p>
                      <p className="font-medium text-text-primary">{new Date(cooperative.target_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-muted">Admin</p>
                    <p className="font-medium text-text-primary">{cooperative.admin_user?.full_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-text-primary mb-4">Members ({cooperative.members?.length || 0})</h2>
                {cooperative.members && cooperative.members.length > 0 ? (
                  <div className="space-y-3">
                    {cooperative.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="text-sm font-medium text-text-primary">{member.user?.full_name}</span>
                          <span className="ml-2 text-xs text-text-muted capitalize">{member.role}</span>
                        </div>
                        <span className="text-sm font-medium text-accent-dark">
                          {formatPrice(member.total_contributed_kobo)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">No members yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center">
                <ProgressRing percentage={cooperative.progress_percentage} />
                <div className="mt-4 text-center">
                  <p className="text-sm text-text-muted">Raised</p>
                  <p className="text-lg font-bold text-accent-dark">{formatPrice(cooperative.total_contributed_kobo)}</p>
                  <p className="text-xs text-text-muted">of {formatPrice(cooperative.target_amount_kobo)}</p>
                </div>
              </div>

              {/* Actions */}
              {isAuthenticated && (
                <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  {!isMember && !isAdmin && (cooperative.status === 'forming' || cooperative.status === 'active') && (
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full bg-accent text-primary py-3 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
                    >
                      {joining ? 'Joining...' : 'Join Cooperative'}
                    </button>
                  )}

                  {(isMember || isAdmin) && (
                    <>
                      {!showContribute ? (
                        <button
                          onClick={() => setShowContribute(true)}
                          className="w-full bg-accent text-primary py-3 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
                        >
                          Make Contribution
                        </button>
                      ) : (
                        <form onSubmit={handleContribute} className="space-y-3">
                          <div>
                            <label className="block text-xs text-text-muted mb-1">Amount (₦)</label>
                            <input
                              type="number"
                              min={1}
                              value={contributeAmount}
                              onChange={(e) => setContributeAmount(e.target.value)}
                              placeholder={cooperative.monthly_contribution_kobo ? `Suggested: ₦${(cooperative.monthly_contribution_kobo / 100).toLocaleString()}` : 'Enter amount'}
                              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={contributing}
                            className="w-full bg-accent text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
                          >
                            {contributing ? 'Processing...' : 'Pay with Paystack'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowContribute(false)}
                            className="w-full py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
