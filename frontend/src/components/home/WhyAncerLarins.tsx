'use client';

import { useRef, useEffect, useState } from 'react';

const DIFFERENTIATORS = [
  {
    title: 'AncerEstimate',
    description: 'Get instant property valuations powered by real market data. Know the true worth before you buy, sell, or rent.',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    accent: 'from-amber-400 to-yellow-500',
    iconBg: 'bg-amber-500/10 dark:bg-amber-400/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'WhatsApp Connect',
    description: 'Reach verified agents instantly via WhatsApp. No waiting, no gatekeepers — chat directly and schedule viewings in seconds.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    accent: 'from-green-400 to-emerald-500',
    iconBg: 'bg-green-500/10 dark:bg-green-400/15',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Neighborhood Intelligence',
    description: 'Community-driven area scores for safety, transport, and amenities. Real insights from real residents to guide your decision.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    accent: 'from-blue-400 to-indigo-500',
    iconBg: 'bg-blue-500/10 dark:bg-blue-400/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Verified Agents Only',
    description: 'Every agent is vetted and verified. Browse with confidence knowing every listing is backed by a real, accountable professional.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    accent: 'from-violet-400 to-purple-500',
    iconBg: 'bg-violet-500/10 dark:bg-violet-400/15',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

function DifferentiatorCard({ item, index }: { item: typeof DIFFERENTIATORS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className="relative group"
      style={prefersReducedMotion ? undefined : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s`,
      }}
    >
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/30">
        {/* Gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
          <svg className={`w-7 h-7 ${item.iconColor}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">
          {item.title}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function WhyAncerLarins() {
  return (
    <section className="py-14 md:py-20 bg-surface" aria-label="Why AncerLarins">
      <div className="container-app">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-accent-dark tracking-widest uppercase">Why AncerLarins</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2">
            Not Just Listings — Intelligence
          </h2>
          <p className="text-text-muted mt-2 max-w-xl mx-auto">
            We go beyond traditional property portals with data-driven tools that help you make smarter real estate decisions in Lagos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DIFFERENTIATORS.map((item, i) => (
            <DifferentiatorCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
