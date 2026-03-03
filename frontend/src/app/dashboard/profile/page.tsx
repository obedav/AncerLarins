'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/schemas/profile';
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
  const [apiError, setApiError] = useState('');

  const profile = user?.agent_profile;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: '',
      bio: '',
      whatsapp_number: '',
      office_address: '',
      website: '',
      specializations: [],
      years_experience: '',
    },
  });

  const specializations = watch('specializations') || [];

  useEffect(() => {
    if (profile) {
      reset({
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        whatsapp_number: profile.whatsapp_number || '',
        office_address: profile.office_address || '',
        website: profile.website || '',
        specializations: profile.specializations || [],
        years_experience: profile.years_experience?.toString() || '',
      });
    }
  }, [profile, reset]);

  const toggleSpecialization = (spec: string) => {
    const current = specializations as string[];
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    setValue('specializations', updated);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setApiError('');
    setSuccess('');
    try {
      await updateProfile({
        company_name: data.company_name || undefined,
        bio: data.bio || undefined,
        whatsapp_number: data.whatsapp_number || undefined,
        office_address: data.office_address || undefined,
        website: data.website || undefined,
        specializations: data.specializations,
        years_experience: data.years_experience ? Number(data.years_experience) : undefined,
      }).unwrap();
      setSuccess('Profile updated successfully.');
      refreshUser();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setApiError(apiErr?.data?.message || 'Failed to update profile.');
    }
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
        setApiError('Failed to submit verification documents.');
      }
    };
    input.click();
  };

  const fieldError = (name: keyof ProfileFormData) => {
    const err = errors[name];
    return err?.message ? <p className="text-error text-xs mt-1">{err.message as string}</p> : null;
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
      {apiError && (
        <div className="bg-error/10 text-error p-3 rounded-xl text-sm">{apiError}</div>
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Business Details</h2>

          <div>
            <label className={labelClass}>Business / Company Name</label>
            <input type="text" {...register('company_name')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Bio / About</label>
            <textarea rows={4} {...register('bio')} placeholder="Tell potential clients about your experience and services..." className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input type="tel" {...register('whatsapp_number')} placeholder="+234..." className={inputClass} />
              {fieldError('whatsapp_number')}
            </div>
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input type="number" min="0" {...register('years_experience')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Office Address</label>
            <input type="text" {...register('office_address')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input type="url" {...register('website')} placeholder="https://..." className={inputClass} />
            {fieldError('website')}
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
                  (specializations as string[]).includes(spec)
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
