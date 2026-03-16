'use client';

import { useState } from 'react';
import { useListPasskeysQuery, useDeletePasskeyMutation } from '@/store/api/authApi';
import { usePasskeyRegister } from '@/hooks/usePasskey';
import { isWebAuthnSupported } from '@/lib/webauthn';

function DeviceIcon({ deviceName }: { deviceName: string }) {
  const name = deviceName.toLowerCase();
  const isPhone = name.includes('iphone') || name.includes('phone') || name.includes('android') || name.includes('mobile') || name.includes('pixel') || name.includes('galaxy') || name.includes('samsung');
  const isTablet = name.includes('ipad') || name.includes('tablet');

  if (isPhone) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }

  if (isTablet) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
      </svg>
    );
  }

  // Default: laptop/desktop
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-border/50" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-border/50 rounded" />
          <div className="h-3 w-48 bg-border/30 rounded" />
        </div>
      </div>
      <div className="h-8 w-16 bg-border/30 rounded-lg" />
    </div>
  );
}

export default function SecurityPage() {
  const { data: passkeysData, isLoading } = useListPasskeysQuery();
  const [deletePasskey, { isLoading: isDeleting }] = useDeletePasskeyMutation();
  const { registerPasskey, isLoading: isRegistering, error: registerError } = usePasskeyRegister();

  const [deviceName, setDeviceName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const passkeys = passkeysData?.data || [];
  const supported = typeof window !== 'undefined' && isWebAuthnSupported();

  const handleAdd = async () => {
    const success = await registerPasskey(deviceName || undefined);
    if (success) {
      setDeviceName('');
      setShowAddForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePasskey(id);
    setDeleteConfirm(null);
  };

  const passkeyToDelete = passkeys.find((p) => p.id === deleteConfirm);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 rounded-lg p-3">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Security</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your passkeys and security settings.</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Passkeys</h2>
            <p className="text-sm text-text-muted mt-1">
              Use biometric authentication (fingerprint, Face ID) for faster, more secure sign-in.
            </p>
          </div>
          {supported && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-primary rounded-xl text-sm font-semibold transition-colors"
            >
              Add passkey
            </button>
          )}
        </div>

        {!supported && (
          <div className="bg-warning/10 text-warning p-4 rounded-xl text-sm mb-4">
            Your browser does not support passkeys. Try using a modern browser like Chrome, Safari, or Edge.
          </div>
        )}

        {registerError && (
          <div className="bg-error/10 text-error p-3 rounded-lg mb-4 text-sm" role="alert">
            {registerError}
          </div>
        )}

        {showAddForm && (
          <div className="bg-background rounded-xl p-5 mb-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/10 rounded-lg p-2">
                <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Register a new passkey</h3>
                <p className="text-xs text-text-muted">Use your device&apos;s biometric sensor to create a passkey</p>
              </div>
            </div>
            <label htmlFor="device-name" className="block text-sm font-medium text-text-secondary mb-1.5">
              Device name (optional)
            </label>
            <input
              id="device-name"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. MacBook Pro, iPhone"
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-primary/20 mb-3 transition-shadow"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isRegistering}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-primary rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register passkey'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setDeviceName(''); }}
                className="px-4 py-2 text-text-muted hover:text-text-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <div className="bg-border/30 rounded-full p-4 mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">No passkeys yet</h3>
            <p className="text-xs text-text-muted text-center max-w-xs">
              Add a passkey to enable fast, secure biometric sign-in with your fingerprint or Face ID.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <DeviceIcon deviceName={passkey.device_name} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{passkey.device_name}</p>
                    <p className="text-xs text-text-muted">
                      Added {new Date(passkey.created_at).toLocaleDateString()}
                      {passkey.last_used_at && (
                        <> &middot; Last used {new Date(passkey.last_used_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(passkey.id)}
                  className="text-text-muted hover:text-error text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl border border-border p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-error/10 rounded-full p-3 mb-4">
                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Remove passkey?</h3>
              <p className="text-sm text-text-muted mb-6">
                {passkeyToDelete ? (
                  <>You will no longer be able to sign in using <span className="font-medium text-text-secondary">{passkeyToDelete.device_name}</span>. This action cannot be undone.</>
                ) : (
                  <>This passkey will be permanently removed. This action cannot be undone.</>
                )}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-error hover:bg-error/80 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Removing...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
