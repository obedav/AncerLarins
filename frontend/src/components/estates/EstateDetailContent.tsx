'use client';

import { useState } from 'react';
import { useGetEstateBySlugQuery, useCreateEstateReviewMutation } from '@/store/api/estateApi';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

const ESTATE_TYPE_LABELS: Record<string, string> = {
  gated_estate: 'Gated Estate',
  open_estate: 'Open Estate',
  highrise: 'Highrise',
  mixed_use: 'Mixed Use',
};

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function EstateDetailContent({ slug }: { slug: string }) {
  const { data, isLoading } = useGetEstateBySlugQuery(slug);
  const { isAuthenticated } = useAuth();
  const [createReview, { isLoading: submitting }] = useCreateEstateReviewMutation();
  const [tab, setTab] = useState<'overview' | 'properties' | 'reviews'>('overview');

  const [reviewForm, setReviewForm] = useState({ rating: 5, pros: '', cons: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const estate = data?.data;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    try {
      await createReview({
        estateId: estate!.id,
        data: {
          rating: reviewForm.rating,
          ...(reviewForm.pros && { pros: reviewForm.pros }),
          ...(reviewForm.cons && { cons: reviewForm.cons }),
        },
      }).unwrap();
      setShowReviewForm(false);
      setReviewForm({ rating: 5, pros: '', cons: '' });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setReviewError(apiError?.data?.message || 'Failed to submit review.');
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
              <div className="h-4 bg-border/50 rounded w-1/4" />
              <div className="h-64 bg-border/50 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!estate) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Estate not found</h1>
            <Link href="/estates" className="text-accent hover:underline">Browse estates</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'properties' as const, label: `Properties (${estate.properties_count || 0})` },
    { key: 'reviews' as const, label: `Reviews (${estate.reviews_count || 0})` },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary py-8 md:py-12">
          <div className="container-app">
            <nav className="text-sm text-white/50 mb-4">
              <Link href="/estates" className="hover:text-accent transition-colors">Estates</Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">{estate.name}</span>
            </nav>
            <div className="flex items-start gap-4">
              {estate.cover_image_url && (
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden relative hidden sm:block">
                  <Image src={estate.cover_image_url} alt={estate.name} fill className="object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{estate.name}</h1>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  {estate.area && <span>{estate.area.name}</span>}
                  <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs font-medium">
                    {ESTATE_TYPE_LABELS[estate.estate_type] || estate.estate_type}
                  </span>
                  {estate.avg_rating && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {estate.avg_rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-app py-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.key
                    ? 'border-accent text-accent-dark'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {estate.description && (
                  <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="font-semibold text-text-primary mb-3">About</h2>
                    <p className="text-text-secondary whitespace-pre-wrap">{estate.description}</p>
                  </div>
                )}

                {estate.amenities && estate.amenities.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="font-semibold text-text-primary mb-3">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {estate.amenities.map((a) => (
                        <span key={a} className="text-sm bg-background border border-border px-3 py-1.5 rounded-lg text-text-secondary">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-text-primary mb-4">Estate Details</h3>
                  <div className="space-y-3 text-sm">
                    {estate.developer && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Developer</span>
                        <span className="text-text-primary font-medium">{estate.developer}</span>
                      </div>
                    )}
                    {estate.year_built && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Year Built</span>
                        <span className="text-text-primary font-medium">{estate.year_built}</span>
                      </div>
                    )}
                    {estate.total_units && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Total Units</span>
                        <span className="text-text-primary font-medium">{estate.total_units.toLocaleString()}</span>
                      </div>
                    )}
                    {estate.security_type && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Security</span>
                        <span className="text-text-primary font-medium">{estate.security_type}</span>
                      </div>
                    )}
                    {estate.service_charge_kobo && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Service Charge</span>
                        <span className="text-text-primary font-semibold">{formatPrice(estate.service_charge_kobo)}/{estate.service_charge_period || 'yr'}</span>
                      </div>
                    )}
                    {estate.electricity_source && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Electricity</span>
                        <span className="text-text-primary font-medium">{estate.electricity_source}</span>
                      </div>
                    )}
                    {estate.water_source && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Water</span>
                        <span className="text-text-primary font-medium">{estate.water_source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {tab === 'properties' && (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <p className="text-text-muted mb-3">Properties listed in this estate</p>
              <Link
                href={`/properties?estate_id=${estate.id}`}
                className="inline-block bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
              >
                View Properties
              </Link>
            </div>
          )}

          {/* Reviews Tab */}
          {tab === 'reviews' && (
            <div className="space-y-6">
              {isAuthenticated && (
                <div className="bg-surface border border-border rounded-2xl p-6">
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <h3 className="font-semibold text-text-primary">Your Review</h3>

                      {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                              className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Pros</label>
                        <textarea
                          value={reviewForm.pros}
                          onChange={(e) => setReviewForm((f) => ({ ...f, pros: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                          placeholder="What do you like about this estate?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Cons</label>
                        <textarea
                          value={reviewForm.cons}
                          onChange={(e) => setReviewForm((f) => ({ ...f, cons: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                          placeholder="What could be improved?"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-accent text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-5 py-2.5 rounded-xl text-sm border border-border text-text-secondary hover:bg-background transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {(!estate.reviews || estate.reviews.length === 0) ? (
                <div className="bg-surface border border-border rounded-xl p-10 text-center">
                  <p className="text-text-muted">No reviews yet. Be the first to review this estate!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {estate.reviews.map((review) => (
                    <div key={review.id} className="bg-surface border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary text-sm">{review.user?.full_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-sm ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.pros && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-600 mb-0.5">Pros</p>
                          <p className="text-sm text-text-secondary">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-red-600 mb-0.5">Cons</p>
                          <p className="text-sm text-text-secondary">{review.cons}</p>
                        </div>
                      )}
                      <p className="text-xs text-text-muted">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
