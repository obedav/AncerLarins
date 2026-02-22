'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PERSONAS = [
  {
    title: 'Investor',
    description: 'Access high-yield properties with verified market data, AncerEstimate valuations, and a dedicated concierge to negotiate the best deals on your behalf.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Seller',
    description: 'List your property and reach qualified, pre-screened buyers through our concierge service. We present your property at its best and close deals faster.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Buyer',
    description: 'Find your dream home with private viewings arranged by our team. We handle inspections, negotiations, and paperwork so you can focus on choosing.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
];

export default function WhyAncerLarins() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="py-16 md:py-24 bg-primary" aria-label="Who we work for" ref={ref}>
      <div className="container-app">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16">
          <div className="reveal-left" data-visible={isVisible}>
            <span className="text-xs font-bold text-accent tracking-widest uppercase">Who We Are</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-3 font-playfair">
              Who we<br />work for
            </h2>
          </div>
          <p className="text-white/40 max-w-md text-sm leading-relaxed reveal-right" data-visible={isVisible}>
            Proprietary technology, latest market data and strong real
            estate expertise allow us to reach potential buyers and present
            them with a well-priced property.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {PERSONAS.map((persona, i) => (
            <div
              key={persona.title}
              className={`reveal-up stagger-${i + 1}`}
              data-visible={isVisible}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-5">
                {persona.icon}
              </div>

              {/* Title */}
              <h3 className="text-white text-xl font-bold mb-3">{persona.title}</h3>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                {persona.description}
              </p>

              {/* Link */}
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-semibold text-sm transition-colors group uppercase tracking-wider"
              >
                Get in Touch
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
