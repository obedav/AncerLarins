'use client';

import { useState, useRef, useCallback } from 'react';
import { useContactAgentMutation, useSavePropertyMutation } from '@/store/api/propertyApi';
import { getLeadSource } from '@/lib/utils';
import type { PropertyDetail } from '@/types';

interface ContactAgentProps {
  property: PropertyDetail;
}

export default function ContactAgent({ property }: ContactAgentProps) {
  const [contactAgent] = useContactAgentMutation();
  const [saveProperty] = useSavePropertyMutation();
  const [loading, setLoading] = useState<'whatsapp' | 'call' | null>(null);
  const cooldownRef = useRef(false);

  const handleContact = useCallback(async (contactType: 'whatsapp' | 'call') => {
    if (cooldownRef.current || loading || !property.id) return;

    cooldownRef.current = true;
    setLoading(contactType);

    try {
      const result = await contactAgent({
        propertyId: property.id,
        contact_type: contactType,
        source: getLeadSource(),
      }).unwrap();

      const data = result.data;

      if (contactType === 'whatsapp' && data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
      } else if (contactType === 'call' && data.phone) {
        window.location.href = `tel:${data.phone}`;
      }
    } catch {
      // Fallback: open WhatsApp/call directly if API fails
      const phone = property.agent?.whatsapp_number || '';
      if (contactType === 'whatsapp') {
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = `tel:${phone}`;
      }
    } finally {
      setLoading(null);
      setTimeout(() => { cooldownRef.current = false; }, 2000);
    }
  }, [contactAgent, loading, property]);

  const agent = property.agent;
  const responseTimeLabel = agent?.avg_response_time
    ? agent.avg_response_time < 60
      ? `Usually responds within ${agent.avg_response_time} min`
      : `Usually responds within ${Math.round(agent.avg_response_time / 60)} hours`
    : null;

  return (
    <>
      {/* Desktop Sidebar Card */}
      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
          {agent && (
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent-dark font-semibold text-lg">
                    {agent.company_name?.[0] || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{agent.company_name}</p>
                  {agent.user && (
                    <p className="text-sm text-text-muted">{agent.user.full_name}</p>
                  )}
                </div>
              </div>
              {agent.verification_status === 'verified' && (
                <div className="flex items-center gap-1 text-success text-sm mb-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified Agent
                </div>
              )}
              {responseTimeLabel && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted bg-background rounded-lg px-3 py-2 mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {responseTimeLabel}
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Button */}
          <button
            onClick={() => handleContact('whatsapp')}
            disabled={loading === 'whatsapp'}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 disabled:opacity-70 text-white py-3.5 rounded-xl font-semibold text-base transition-colors mb-3"
          >
            {loading === 'whatsapp' ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            )}
            WhatsApp Agent
          </button>

          {/* Call Button */}
          <button
            onClick={() => handleContact('call')}
            disabled={loading === 'call'}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-70 text-white py-3 rounded-xl font-medium text-sm transition-colors mb-3"
          >
            {loading === 'call' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            Call Agent
          </button>

          {/* Save Button */}
          <button
            onClick={() => property.id && saveProperty(property.id)}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent-dark text-text-secondary py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            Save Property
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-4 py-3">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => handleContact('call')}
            disabled={loading === 'call'}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-70 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {loading === 'call' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            Call
          </button>
          <button
            onClick={() => handleContact('whatsapp')}
            disabled={loading === 'whatsapp'}
            className="flex-[2] flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 disabled:opacity-70 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading === 'whatsapp' ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            )}
            WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
