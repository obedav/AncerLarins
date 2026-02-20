'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const STATS = [
  { value: 'Free', label: 'To List Properties', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'Verified', label: 'Agent Badge', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { value: 'Direct', label: 'WhatsApp Leads', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" aria-label="Call to action" ref={ref}>
      {/* Photo background */}
      <div className="absolute inset-0">
        <Image
          src="/images/home/cta-background.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
          aria-hidden="true"
        />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary/85 dark:bg-primary/92" />
      {/* Radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent)/0.08_0%,_transparent_60%)]" />

      <div className="container-app relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left: Content */}
          <div className="reveal-left text-center lg:text-left" data-visible={isVisible}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              List Your Property Today
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              It&apos;s free, takes minutes, and puts you in front of buyers and tenants across Lagos with a verified agent badge and instant WhatsApp contact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register?role=agent"
                className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-xl font-semibold transition-colors text-base inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Get Started Free
              </Link>
              <Link
                href="/properties"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-colors text-base inline-flex items-center justify-center gap-2"
              >
                Browse Properties
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Floating glass stat cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end mt-0 reveal-right" data-visible={isVisible}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-2xl px-6 py-5 flex items-center gap-4 w-72 ${
                  i === 0 ? 'animate-float' : i === 1 ? 'animate-float-delayed' : 'animate-float-delayed-2'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-accent-dark/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: stat strip */}
          <div className="lg:hidden grid grid-cols-3 gap-3 mt-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] rounded-xl p-3 text-center">
                <span className="text-xl font-bold text-white block">{stat.value}</span>
                <span className="text-white/60 text-[11px]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
