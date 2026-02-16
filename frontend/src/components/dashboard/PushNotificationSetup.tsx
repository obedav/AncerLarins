'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterPushTokenMutation } from '@/store/api/userApi';
import { isPushSupported, getFCMToken, registerServiceWorker } from '@/lib/push';

export default function PushNotificationSetup() {
  const { isAuthenticated } = useAuth();
  const [registerToken] = useRegisterPushTokenMutation();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isPushSupported()) return;

    // Check if already granted
    if (Notification.permission === 'granted') {
      // Already granted — register token silently
      registerServiceWorker();
      getFCMToken().then((token) => {
        if (token) {
          registerToken({ token, device_type: 'web' });
        }
      });
      return;
    }

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('push_prompt_dismissed');
    if (Notification.permission === 'default' && !wasDismissed) {
      // Show prompt after a delay
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, registerToken]);

  const handleEnable = async () => {
    const token = await getFCMToken();
    if (token) {
      registerToken({ token, device_type: 'web' });
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('push_prompt_dismissed', '1');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-surface border border-border rounded-xl shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Enable Notifications</p>
          <p className="text-xs text-text-muted mt-0.5">
            Get instant alerts when new properties match your searches
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              className="bg-primary text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-text-muted hover:text-text-secondary px-2 py-1.5"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
