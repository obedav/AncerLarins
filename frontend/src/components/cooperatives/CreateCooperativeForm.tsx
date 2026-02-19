'use client';

import { useState } from 'react';
import { useCreateCooperativeMutation } from '@/store/api/cooperativeApi';
import type { CreateCooperativePayload } from '@/types/cooperative';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCooperativeForm({ onSuccess, onCancel }: Props) {
  const [createCooperative, { isLoading }] = useCreateCooperativeMutation();
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateCooperativePayload>({
    name: '',
    target_amount_kobo: 0,
  });

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = { ...form };
    if (!payload.description) delete payload.description;
    if (!payload.monthly_contribution_kobo) delete payload.monthly_contribution_kobo;
    if (!payload.start_date) delete payload.start_date;
    if (!payload.target_date) delete payload.target_date;

    try {
      await createCooperative(payload).unwrap();
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to create cooperative.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Lekki Homeowners Group"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
        <textarea
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe the purpose of this cooperative..."
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Target Amount (₦) *</label>
          <input
            type="number"
            min={1000}
            value={form.target_amount_kobo ? form.target_amount_kobo / 100 : ''}
            onChange={(e) => update('target_amount_kobo', e.target.value ? Number(e.target.value) * 100 : 0)}
            placeholder="e.g. 50000000"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Monthly Contribution (₦)</label>
          <input
            type="number"
            min={0}
            value={form.monthly_contribution_kobo ? form.monthly_contribution_kobo / 100 : ''}
            onChange={(e) => update('monthly_contribution_kobo', e.target.value ? Number(e.target.value) * 100 : undefined)}
            placeholder="e.g. 100000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Start Date</label>
          <input
            type="date"
            value={form.start_date || ''}
            onChange={(e) => update('start_date', e.target.value || undefined)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Target Date</label>
          <input
            type="date"
            value={form.target_date || ''}
            onChange={(e) => update('target_date', e.target.value || undefined)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent text-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Cooperative'}
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
