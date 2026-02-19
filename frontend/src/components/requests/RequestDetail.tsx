'use client';

import { useState } from 'react';
import { useGetPropertyRequestQuery, useRespondToRequestMutation, useAcceptRequestResponseMutation } from '@/store/api/requestApi';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

function formatPrice(kobo: number | null): string {
  if (!kobo) return 'N/A';
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function RequestDetail({ id }: { id: string }) {
  const { data, isLoading } = useGetPropertyRequestQuery(id);
  const { user } = useAuth();
  const [respondToRequest, { isLoading: responding }] = useRespondToRequestMutation();
  const [acceptResponse, { isLoading: accepting }] = useAcceptRequestResponseMutation();

  const [showRespondForm, setShowRespondForm] = useState(false);
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [responseError, setResponseError] = useState('');

  const request = data?.data;

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseError('');
    try {
      await respondToRequest({
        requestId: id,
        data: {
          message,
          ...(proposedPrice ? { proposed_price_kobo: Number(proposedPrice) * 100 } : {}),
        },
      }).unwrap();
      setShowRespondForm(false);
      setMessage('');
      setProposedPrice('');
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setResponseError(apiError?.data?.message || 'Failed to submit response.');
    }
  };

  const handleAccept = async (responseId: string) => {
    try {
      await acceptResponse({ requestId: id, responseId }).unwrap();
    } catch {
      // handled by RTK Query
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="container-app py-10">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-border/50 rounded w-2/3" />
              <div className="h-4 bg-border/50 rounded w-1/3" />
              <div className="h-40 bg-border/50 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!request) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Request not found</h1>
            <Link href="/requests" className="text-accent hover:underline">Browse requests</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isOwner = user?.id === request.user?.id;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container-app py-8 md:py-10">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/requests" className="hover:text-accent transition-colors">Requests</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{request.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary">{request.title}</h1>
                  <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                    request.status === 'active' ? 'bg-green-100 text-green-700' :
                    request.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <p className="text-text-secondary whitespace-pre-wrap">{request.description}</p>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Type</p>
                    <p className="text-sm font-medium text-text-primary capitalize">{request.listing_type}</p>
                  </div>
                  {request.area && (
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">Area</p>
                      <p className="text-sm font-medium text-text-primary">{request.area.name}</p>
                    </div>
                  )}
                  {request.property_type && (
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">Property Type</p>
                      <p className="text-sm font-medium text-text-primary">{request.property_type.name}</p>
                    </div>
                  )}
                  {(request.min_bedrooms || request.max_bedrooms) && (
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">Bedrooms</p>
                      <p className="text-sm font-medium text-text-primary">
                        {request.min_bedrooms && request.max_bedrooms
                          ? `${request.min_bedrooms}–${request.max_bedrooms}`
                          : request.min_bedrooms ? `${request.min_bedrooms}+` : `Up to ${request.max_bedrooms}`}
                      </p>
                    </div>
                  )}
                  {request.budget_kobo && (
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">Budget</p>
                      <p className="text-sm font-semibold text-accent-dark">{formatPrice(request.budget_kobo)}</p>
                    </div>
                  )}
                  {request.move_in_date && (
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">Move-in Date</p>
                      <p className="text-sm font-medium text-text-primary">{new Date(request.move_in_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {request.amenity_preferences && request.amenity_preferences.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-text-muted mb-2">Preferred Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {request.amenity_preferences.map((a) => (
                        <span key={a} className="text-xs bg-background border border-border px-2.5 py-1 rounded-lg text-text-secondary">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Responses */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Responses ({request.responses?.length || 0})
                </h2>

                {(!request.responses || request.responses.length === 0) ? (
                  <p className="text-text-muted text-sm">No responses yet.</p>
                ) : (
                  <div className="space-y-4">
                    {request.responses.map((resp) => (
                      <div key={resp.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {resp.agent?.logo_url ? (
                              <img src={resp.agent.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                                <span className="text-accent text-xs font-bold">{resp.agent?.company_name?.[0]}</span>
                              </div>
                            )}
                            <span className="text-sm font-semibold text-text-primary">{resp.agent?.company_name}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            resp.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            resp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {resp.status.charAt(0).toUpperCase() + resp.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-text-secondary mb-2">{resp.message}</p>

                        {resp.proposed_price_kobo && (
                          <p className="text-sm font-semibold text-accent-dark mb-2">
                            Proposed: {formatPrice(resp.proposed_price_kobo)}
                          </p>
                        )}

                        {resp.property && (
                          <Link href={`/properties/${resp.property.slug}`} className="text-sm text-accent hover:underline">
                            View suggested property: {resp.property.title}
                          </Link>
                        )}

                        {isOwner && resp.status === 'pending' && request.status === 'active' && (
                          <button
                            onClick={() => handleAccept(resp.id)}
                            disabled={accepting}
                            className="mt-3 bg-accent text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
                          >
                            {accepting ? 'Accepting...' : 'Accept Response'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent respond CTA */}
              {!isOwner && request.status === 'active' && (
                <div className="bg-surface border border-border rounded-2xl p-6">
                  {!showRespondForm ? (
                    <button
                      onClick={() => setShowRespondForm(true)}
                      className="w-full bg-accent text-primary py-3 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors"
                    >
                      Respond to This Request
                    </button>
                  ) : (
                    <form onSubmit={handleRespond} className="space-y-4">
                      <h3 className="font-semibold text-text-primary">Your Response</h3>

                      {responseError && (
                        <p className="text-red-600 text-sm">{responseError}</p>
                      )}

                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe what you can offer..."
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        required
                      />

                      <div>
                        <label className="block text-xs text-text-muted mb-1">Proposed Price (₦)</label>
                        <input
                          type="number"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={responding}
                          className="flex-1 bg-accent text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
                        >
                          {responding ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRespondForm(false)}
                          className="px-4 py-2.5 rounded-xl text-sm border border-border text-text-secondary hover:bg-background transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Request info card */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-3">Request Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Posted by</span>
                    <span className="text-text-primary font-medium">{request.user?.full_name || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Responses</span>
                    <span className="text-text-primary font-medium">{request.response_count}</span>
                  </div>
                  {request.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Expires</span>
                      <span className="text-text-primary font-medium">{new Date(request.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Posted</span>
                    <span className="text-text-primary font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
