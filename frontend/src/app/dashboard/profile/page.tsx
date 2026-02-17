'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateAgentProfileMutation, useSubmitVerificationMutation } from '@/store/api/agentApi';
import { VerificationBadge } from '@/components/dashboard/StatusBadge';
import { ProfileCompleteness } from '@/components/dashboard/AgentOnboarding';

const SPECIALIZATION_OPTIONS = [
  'Residential', 'Commercial', 'Luxury', 'Land', 'Short-let',
  'Rental', 'Sales', 'Property Management',
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [updateProfile, { isLoading: saving }] = useUpdateAgentProfileMutation();
  const [submitVerification, { isLoading: submitting }] = useSubmitVerificationMutation();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const profile = user?.agent_profile;

  const [form, setForm] = useState({
    company_name: '',
    bio: '',
    whatsapp_number: '',
    office_address: '',
    website: '',
    specializations: [] as string[],
    years_experience: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        whatsapp_number: profile.whatsapp_number || '',
        office_address: profile.office_address || '',
        website: profile.website || '',
        specializations: profile.specializations || [],
        years_experience: profile.years_experience?.toString() || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        company_name: form.company_name,
        bio: form.bio,
        whatsapp_number: form.whatsapp_number,
        office_address: form.office_address,
        website: form.website,
        specializations: form.specializations,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
      }).unwrap();
      setSuccess('Profile updated successfully.');
      refreshUser();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setError(apiErr?.data?.message || 'Failed to update profile.');
    }
  };

  const toggleSpecialization = (spec: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleVerificationSubmit = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', 'government_id');
      try {
        await submitVerification(formData).unwrap();
        setSuccess('Verification documents submitted. We\'ll review them shortly.');
        refreshUser();
      } catch {
        setError('Failed to submit verification documents.');
      }
    };
    input.click();
  };

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary text-sm';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Agent Profile</h1>
        <p className="text-sm text-text-muted mt-1">Manage your business details and verification.</p>
      </div>

      {/* Profile Completeness Meter */}
      {user && <ProfileCompleteness user={user} />}

      {success && (
        <div className="bg-success/10 text-success p-3 rounded-xl text-sm">{success}</div>
      )}
      {error && (
        <div className="bg-error/10 text-error p-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Verification Status */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Verification Status</h2>
          {profile && <VerificationBadge status={profile.verification_status} />}
        </div>
        {profile?.verification_status === 'unverified' && (
          <div>
            <p className="text-sm text-text-muted mb-3">
              Verified agents get a badge and more visibility. Upload a valid ID to get verified.
            </p>
            <button
              onClick={handleVerificationSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Upload Verification Document'}
            </button>
          </div>
        )}
        {profile?.verification_status === 'pending' && (
          <p className="text-sm text-text-muted">Your verification is under review. We&apos;ll notify you once it&apos;s complete.</p>
        )}
        {profile?.verification_status === 'rejected' && (
          <div>
            <p className="text-sm text-error mb-3">Your verification was rejected. Please re-submit with a clearer document.</p>
            <button
              onClick={handleVerificationSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Re-submit Document
            </button>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Business Details</h2>

          <div>
            <label className={labelClass}>Business / Company Name</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio / About</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell potential clients about your experience and services..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                type="tel"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="+234..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input
                type="number"
                min="0"
                value={form.years_experience}
                onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Office Address</label>
            <input
              type="text"
              value={form.office_address}
              onChange={(e) => setForm({ ...form, office_address: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-primary mb-3">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpecialization(spec)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.specializations.includes(spec)
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-text-secondary hover:border-accent-dark'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent hover:bg-accent-dark text-primary py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
