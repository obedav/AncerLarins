'use client';

import { useState } from 'react';
import { useGetAreaInsightsQuery, useSubmitAreaReviewMutation } from '@/store/api/locationApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function NeighborhoodInsights({ areaId, areaName }: { areaId: string; areaName: string }) {
  const { data, isLoading, isError } = useGetAreaInsightsQuery(areaId);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitReview, { isLoading: submitting }] = useSubmitAreaReviewMutation();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    overall: 3, safety: 3, transport: 3, amenities: 3, noise: 3,
    comment: '', lived_duration: '',
  });

  const insights = data?.data;

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
        <div className="h-6 bg-border/50 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-border/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Fallback scores when API fails or returns no data
  const scores = insights?.scores ?? { overall: 0, safety: 0, transport: 0, amenities: 0, noise: 0 };
  const reviewCount = insights?.review_count ?? 0;

  const clamp = (v: number) => Math.min(Math.max(v, 0), 5);

  const scoreEntries = [
    { label: 'Safety', value: clamp(scores.safety), color: 'bg-success' },
    { label: 'Transport', value: clamp(scores.transport), color: 'bg-primary' },
    { label: 'Amenities', value: clamp(scores.amenities), color: 'bg-accent-dark' },
    { label: 'Noise Level', value: clamp(scores.noise), color: 'bg-error' },
  ];

  const hasAnyScore = scoreEntries.some((e) => e.value > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReview({ areaId, ...reviewForm }).unwrap();
      setShowForm(false);
      setSubmitted(true);
      toast('Review submitted! It will appear after approval.', 'success');
    } catch {
      toast('Could not submit review. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Neighborhood: {areaName}</h2>
          <p className="text-xs text-text-muted">
            {reviewCount > 0
              ? `Based on ${reviewCount} resident review${reviewCount !== 1 ? 's' : ''}`
              : isError
                ? 'Community-driven area insights'
                : 'Be the first to rate this neighborhood'}
          </p>
        </div>
        {scores.overall > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-dark">{clamp(scores.overall).toFixed(1)}</p>
            <p className="text-xs text-text-muted">Overall</p>
          </div>
        )}
      </div>

      {/* Score Bars */}
      {hasAnyScore ? (
        <div className="space-y-3 mb-5">
          {scoreEntries.map((entry) => (
            <div key={entry.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">{entry.label}</span>
                <span className="text-text-primary font-medium">{entry.value > 0 ? entry.value.toFixed(1) : '-'}/5</span>
              </div>
              <div className="w-full bg-border/50 rounded-full h-2">
                <div
                  className={`${entry.color} h-2 rounded-full transition-all`}
                  style={{ width: `${(entry.value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-5 py-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
            <svg className="w-6 h-6 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary font-medium">No ratings yet for {areaName}</p>
          <p className="text-xs text-text-muted mt-1">Help others by sharing your experience living here</p>
        </div>
      )}

      {/* Rent Averages */}
      {insights && (insights.rent_averages['1br'] || insights.rent_averages['2br'] || insights.rent_averages['3br']) && (
        <div className="mb-5 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Average Rent in {areaName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            {insights.rent_averages['1br'] && (
              <div className="bg-background rounded-lg py-2 px-1">
                <p className="text-xs text-text-muted">1 Bed</p>
                <p className="text-sm font-semibold text-text-primary">{formatPrice(insights.rent_averages['1br'])}</p>
              </div>
            )}
            {insights.rent_averages['2br'] && (
              <div className="bg-background rounded-lg py-2 px-1">
                <p className="text-xs text-text-muted">2 Bed</p>
                <p className="text-sm font-semibold text-text-primary">{formatPrice(insights.rent_averages['2br'])}</p>
              </div>
            )}
            {insights.rent_averages['3br'] && (
              <div className="bg-background rounded-lg py-2 px-1">
                <p className="text-xs text-text-muted">3 Bed</p>
                <p className="text-sm font-semibold text-text-primary">{formatPrice(insights.rent_averages['3br'])}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      {insights && insights.recent_reviews.length > 0 && (
        <div className="mb-5 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {insights.recent_reviews.map((review) => (
              <div key={review.id} className="bg-background rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{review.user_name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-dark text-sm font-bold">{review.overall}</span>
                    <svg className="w-3.5 h-3.5 text-accent-dark" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                {review.lived_duration && (
                  <p className="text-xs text-text-muted mb-1">Lived here: {review.lived_duration}</p>
                )}
                {review.comment && (
                  <p className="text-sm text-text-secondary">{review.comment}</p>
                )}
                <p className="text-xs text-text-muted mt-1">{formatRelativeTime(review.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate CTA / Form */}
      {submitted ? (
        <div className="bg-success/10 text-success rounded-lg p-3 text-sm">
          Thanks for your review! It will appear after approval.
        </div>
      ) : showForm && isAuthenticated ? (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-border space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Rate this Neighborhood</h3>
          {(['overall', 'safety', 'transport', 'amenities', 'noise'] as const).map((field) => (
            <div key={field} className="flex items-center justify-between">
              <label className="text-sm text-text-secondary capitalize">{field}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setReviewForm((p) => ({ ...p, [field]: v }))}
                    aria-label={`Rate ${field} ${v} out of 5`}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      reviewForm[field] >= v
                        ? 'bg-accent-dark text-white'
                        : 'bg-background border border-border text-text-muted'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
            placeholder="Share your experience (optional)"
            aria-label="Neighborhood review comment"
            maxLength={1000}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm text-text-primary focus:outline-none focus:border-accent-dark"
          />
          <select
            value={reviewForm.lived_duration}
            onChange={(e) => setReviewForm((p) => ({ ...p, lived_duration: e.target.value }))}
            aria-label="How long have you lived here"
            className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm text-text-secondary focus:outline-none focus:border-accent-dark"
          >
            <option value="">How long have you lived here?</option>
            <option value="Less than 6 months">Less than 6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3+ years">3+ years</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent hover:bg-accent-dark text-text-primary px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 border border-accent/30 rounded-xl text-sm font-medium text-accent-dark hover:bg-accent/10 transition-colors"
        >
          {isAuthenticated ? 'Rate this Neighborhood' : 'Login to Rate this Neighborhood'}
        </button>
      )}
    </div>
  );
}
