'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } from '@/store/api/adminApi';

const SETTING_FIELDS = [
  { key: 'property_expiry_days', label: 'Property Expiry (days)', type: 'number', min: 1, max: 365, description: 'How long before properties auto-expire from listings', icon: 'clock' },
  { key: 'featured_default_days', label: 'Featured Default (days)', type: 'number', min: 1, max: 365, description: 'Default duration a property stays featured after promotion', icon: 'star' },
  { key: 'landmark_radius_km', label: 'Landmark Radius (km)', type: 'number', min: 0.1, max: 100, step: 0.1, description: 'Default radius for nearby landmarks search around properties', icon: 'map' },
  { key: 'landmark_limit', label: 'Landmark Limit', type: 'number', min: 1, max: 500, description: 'Maximum number of landmarks returned per property query', icon: 'pin' },
  { key: 'max_upload_size_mb', label: 'Max Upload Size (MB)', type: 'number', min: 1, max: 100, description: 'Maximum allowed file size for image and document uploads', icon: 'upload' },
] as const;

function FieldIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'clock':
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    case 'map':
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      );
    case 'pin':
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    case 'upload':
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useGetSystemSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSystemSettingsMutation();
  const [form, setForm] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState(false);

  if (user && user.role !== 'super_admin') {
    router.push('/admin');
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (data?.data) {
      setForm(data.data);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateSettings(form).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { /* handled by RTK */ }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Banner */}
        <div className="animate-pulse bg-border/30 rounded-2xl h-32" />

        {/* Skeleton Fields */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-border/50 rounded" />
                <div className="h-4 bg-border/50 rounded w-36" />
              </div>
              <div className="h-2.5 bg-border/30 rounded w-64 mb-3" />
              <div className="h-11 bg-border/40 rounded-xl max-w-xs" />
            </div>
          ))}
          <div className="pt-4 border-t border-border">
            <div className="animate-pulse h-11 bg-border/40 rounded-xl w-36" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Gradient Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">System Settings</h1>
            </div>
            <p className="text-white/60 text-sm">
              Configure platform-wide defaults and limits
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-semibold shrink-0 self-start sm:self-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Super Admin
          </span>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full bg-white/5" />
      </div>

      {/* Settings Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
        <div className="space-y-7">
          {SETTING_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-1">
                <FieldIcon icon={field.icon} />
                {field.label}
              </label>
              <p className="text-xs text-text-muted mb-2.5 ml-6">
                {field.description}
              </p>
              <input
                type="number"
                value={form[field.key] ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: Number(e.target.value) })}
                min={field.min}
                max={field.max}
                step={'step' in field ? field.step : 1}
                className="w-full max-w-xs px-4 py-2.5 border border-border rounded-xl bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Save Row */}
        <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
          {success && (
            <span className="inline-flex items-center gap-1.5 text-sm text-success font-medium animate-in fade-in duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
