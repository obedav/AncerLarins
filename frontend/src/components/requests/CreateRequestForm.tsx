'use client';

import { useState } from 'react';
import { useCreatePropertyRequestMutation } from '@/store/api/requestApi';
import type { CreatePropertyRequestPayload } from '@/types/request';
import type { ListingType } from '@/types';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Buy' },
  { value: 'short_let', label: 'Short Let' },
];

export default function CreateRequestForm({ onSuccess, onCancel }: Props) {
  const [createRequest, { isLoading }] = useCreatePropertyRequestMutation();
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreatePropertyRequestPayload>({
    title: '',
    description: '',
    listing_type: 'rent',
  });

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Clean up empty optional fields
    const payload = { ...form };
    if (!payload.min_bedrooms) delete payload.min_bedrooms;
    if (!payload.max_bedrooms) delete payload.max_bedrooms;
    if (!payload.budget_kobo) delete payload.budget_kobo;
    if (!payload.move_in_date) delete payload.move_in_date;

    try {
      await createRequest(payload).unwrap();
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to create request.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Looking for 2-bed apartment in Lekki"
          className={inputClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe what you're looking for in detail..."
          rows={4}
          className={inputClass}
          required
        />
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">I want to</label>
        <div className="flex gap-2">
          {LISTING_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update('listing_type', t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.listing_type === t.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:bg-background'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms & Budget row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Min Bedrooms</label>
          <input
            type="number"
            min={0}
            max={20}
            value={form.min_bedrooms || ''}
            onChange={(e) => update('min_bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Max Bedrooms</label>
          <input
            type="number"
            min={0}
            max={20}
            value={form.max_bedrooms || ''}
            onChange={(e) => update('max_bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Budget (₦)</label>
          <input
            type="number"
            min={0}
            value={form.budget_kobo ? form.budget_kobo / 100 : ''}
            onChange={(e) => update('budget_kobo', e.target.value ? Number(e.target.value) * 100 : undefined)}
            placeholder="e.g. 2000000"
            className={inputClass}
          />
        </div>
      </div>

      {/* Move-in date */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Preferred Move-in Date</label>
        <input
          type="date"
          value={form.move_in_date || ''}
          onChange={(e) => update('move_in_date', e.target.value || undefined)}
          className={inputClass}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent text-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Post Request'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
