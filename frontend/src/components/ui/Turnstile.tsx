'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Turnstile({ onVerify, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) return; // Already rendered

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: handleVerify,
        'expired-callback': onExpire,
        theme: 'dark',
        appearance: 'interaction-only',
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [handleVerify, onExpire]);

  // Don't render anything if Turnstile is not configured
  if (!SITE_KEY) return null;

  return <div ref={containerRef} className={className} />;
}
