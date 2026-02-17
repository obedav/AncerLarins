'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateSavedSearchMutation } from '@/store/api/userApi';
import type { SearchFilters } from '@/types';

interface Props {
  filters: SearchFilters;
}

export default function SaveSearchButton({ filters }: Props) {
  const { isAuthenticated } = useAuth();
  const [createSavedSearch, { isLoading }] = useCreateSavedSearchMutation();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('instant');
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) return null;

  const hasFilters = filters.listing_type || filters.property_type_id || filters.city_id ||
    filters.area_id || filters.min_price || filters.max_price || filters.min_bedrooms || filters.q;

  if (!hasFilters) return null;

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await createSavedSearch({
        name: name.trim(),
        listing_type: filters.listing_type,
        property_type_id: filters.property_type_id,
        city_id: filters.city_id,
        area_ids: filters.area_id ? [filters.area_id] : undefined,
        min_price: filters.min_price,
        max_price: filters.max_price,
        min_bedrooms: filters.min_bedrooms,
        notification_frequency: frequency,
      }).unwrap();

      setSaved(true);
      setShowModal(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          saved
            ? 'bg-success/10 text-success'
            : 'bg-accent/10 text-accent-dark hover:bg-accent/20'
        }`}
        aria-label={saved ? 'Search saved' : 'Save this search'}
      >
        <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        {saved ? 'Saved!' : 'Save Search'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-label="Save search">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Save This Search</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Search Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 3-bed apartments in Lekki"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Notify me</label>
                <div className="flex gap-2">
                  {[
                    { value: 'instant', label: 'Instantly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        frequency === opt.value
                          ? 'border-accent-dark bg-accent/10 text-accent-dark'
                          : 'border-border text-text-muted hover:border-text-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || isLoading}
                className="flex-1 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Search'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
