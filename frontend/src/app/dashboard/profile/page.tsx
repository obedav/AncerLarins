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

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-text-primary text-sm transition-all';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 rounded-lg p-3">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Agent Profile</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your business details and verification.</p>
        </div>
      </div>

      {/* Profile Completeness Meter */}
      {user && <ProfileCompleteness user={user} />}

      {/* Success Alert */}
      {success && (
        <div className="bg-success/10 text-success p-4 rounded-xl text-sm flex items-center gap-3 border border-success/20">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Error Alert */}
      {apiError && (
        <div className="bg-error/10 text-error p-4 rounded-xl text-sm flex items-center gap-3 border border-error/20">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Verification Status */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {profile?.verification_status === 'verified' ? (
              <div className="bg-success/10 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
            ) : profile?.verification_status === 'pending' ? (
              <div className="bg-warning/10 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            ) : profile?.verification_status === 'rejected' ? (
              <div className="bg-error/10 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            ) : (
              <div className="bg-primary/10 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
            )}
            <h2 className="font-semibold text-text-primary text-base">Verification Status</h2>
          </div>
          {profile && <VerificationBadge status={profile.verification_status} />}
        </div>
        {profile?.verification_status === 'unverified' && (
          <div>
            <p className="text-sm text-text-muted mb-4">
              Verified agents get a badge and more visibility. Upload a valid ID to get verified.
            </p>
            <button
              onClick={handleVerificationSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Verification Document
                </>
              )}
            </button>
          </div>
        )}
        {profile?.verification_status === 'pending' && (
          <p className="text-sm text-text-muted">Your verification is under review. We&apos;ll notify you once it&apos;s complete.</p>
        )}
        {profile?.verification_status === 'rejected' && (
          <div>
            <p className="text-sm text-error mb-4">Your verification was rejected. Please re-submit with a clearer document.</p>
            <button
              onClick={handleVerificationSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Re-submit Document'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Details Section */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="bg-primary/10 rounded-lg p-2">
              <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="font-semibold text-text-primary text-base">Business Details</h2>
          </div>

          <div>
            <label className={labelClass}>Business / Company Name</label>
            <input type="text" {...register('company_name')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Bio / About</label>
            <textarea rows={4} {...register('bio')} placeholder="Tell potential clients about your experience and services..." className={inputClass} />
          </div>

          {/* Separator */}
          <div className="border-t border-border" />

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

        {/* Specializations Section */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="bg-primary/10 rounded-lg p-2">
              <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
            <h2 className="font-semibold text-text-primary text-base">Specializations</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpecialization(spec)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
                  (specializations as string[]).includes(spec)
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background border border-border text-text-secondary hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {(specializations as string[]).includes(spec) && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                )}
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent hover:bg-accent-dark text-primary py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
}
