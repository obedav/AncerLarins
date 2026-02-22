'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const STEPS = [
  {
    step: '1',
    title: 'Request a Private Viewing',
    desc: 'Browse our curated listings and submit an inquiry on any property you love. Our team responds within 2 hours.',
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'We Arrange the Inspection',
    desc: 'Our concierge team qualifies your needs, arranges property inspections, and accompanies you through every viewing.',
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'Your Dream Home. Secured.',
    desc: 'We handle negotiations, paperwork, and closing. You get your dream property with full professional support.',
    icon: (
      <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-surface" aria-label="How it works" ref={ref}>
      <div className="container-app">
        {/* Header */}
        <div className="mb-12 md:mb-16 reveal-up" data-visible={isVisible}>
          <span className="text-xs font-bold text-accent tracking-widest uppercase">How It Works</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mt-3 font-playfair max-w-lg">
            We&apos;ll help you find your home, with our Guaranteed services
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className={`reveal-up stagger-${i + 1}`}
              data-visible={isVisible}
            >
              {/* Icon */}
              <div className="mb-6">
                {step.icon}
              </div>

              {/* Step label */}
              <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
                Step {step.step}
              </p>

              {/* Title */}
              <h3 className="text-white text-lg font-bold mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
