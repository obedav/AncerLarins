'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TESTIMONIALS = [
  {
    name: 'Adebayo Ogundimu',
    role: 'Homebuyer, Lekki',
    text: 'The AncerEstimate gave me confidence to negotiate. I ended up saving over 2 million naira on my apartment purchase. No other platform in Lagos offers this kind of transparency.',
    rating: 5,
    initials: 'AO',
  },
  {
    name: 'Chidinma Okafor',
    role: 'Renter, Victoria Island',
    text: 'I found my dream apartment in VI within a week. The WhatsApp connect feature meant I could chat with the agent immediately — no waiting for callbacks. Absolutely seamless.',
    rating: 5,
    initials: 'CO',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Property Agent',
    text: 'As an agent, AncerLarins has tripled my leads. The verified badge builds trust instantly with clients, and the dashboard makes managing listings incredibly easy.',
    rating: 5,
    initials: 'IM',
  },
  {
    name: 'Folake Adeyemi',
    role: 'Homebuyer, Ikeja',
    text: 'The neighborhood scores helped me avoid a risky area I was considering. The community reviews are honest and incredibly helpful for someone new to Lagos.',
    rating: 4,
    initials: 'FA',
  },
  {
    name: 'Emeka Nwosu',
    role: 'Short Let Host, Lekki',
    text: 'Listing my short let property was straightforward. The daily pricing and check-in/out time features are exactly what short-term rental hosts need. Great platform.',
    rating: 5,
    initials: 'EN',
  },
  {
    name: 'Aisha Bello',
    role: 'Renter, Yaba',
    text: 'I relocated from Abuja and needed a place fast. The area insights and market trends helped me understand Yaba pricing before I even visited. Found a great place at fair value.',
    rating: 5,
    initials: 'AB',
  },
];

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-accent-dark' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  colorIdx,
  isCenter,
}: {
  testimonial: typeof TESTIMONIALS[0];
  colorIdx: number;
  isCenter?: boolean;
}) {
  return (
    <div
      className={`bg-surface rounded-2xl border p-6 transition-all duration-500 relative overflow-hidden ${
        isCenter !== undefined
          ? isCenter
            ? 'border-accent/40 shadow-lg scale-[1.02] z-10 border-l-accent-dark border-l-2'
            : 'border-border opacity-60 scale-[0.98]'
          : 'border-accent/30 shadow-md'
      }`}
    >
      {/* Decorative quote mark */}
      <svg className="absolute top-4 right-4 w-8 h-8 text-accent-dark/[0.07]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
      </svg>
      <StarRating rating={testimonial.rating} />
      <p className={`text-text-secondary mt-4 text-sm leading-relaxed relative ${isCenter !== undefined ? 'line-clamp-4' : ''}`}>
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}`}>
          <span className="text-sm font-bold">{testimonial.initials}</span>
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm">{testimonial.name}</p>
          <p className="text-xs text-text-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const touchStartX = useRef(0);
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const goTo = useCallback((idx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % TESTIMONIALS.length);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, [active, goTo]);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  // Show 3 cards at a time on desktop — the active one is centered and highlighted
  const getVisibleIndices = () => {
    const prevIdx = (active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
    const nextIdx = (active + 1) % TESTIMONIALS.length;
    return [prevIdx, active, nextIdx];
  };

  const visible = getVisibleIndices();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }, [next, prev]);

  return (
    <section className="py-14 md:py-20 bg-surface relative overflow-hidden" aria-label="Testimonials" ref={sectionRef}>
      {/* Large decorative background quote */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] text-accent-dark opacity-[0.03] pointer-events-none" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
      </svg>

      <div className="container-app relative">
        <div className="text-center mb-10 reveal-up" data-visible={isVisible}>
          <span className="text-xs font-bold text-accent-dark tracking-widest uppercase">Testimonials</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2">
            Trusted by Lagosians
          </h2>
          <p className="text-text-muted mt-2 max-w-lg mx-auto">
            Real experiences from homebuyers, renters, and agents across Lagos
          </p>

        </div>

        {/* Desktop 3-card layout */}
        <div
          className="hidden md:grid md:grid-cols-3 gap-5 max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-live="polite"
        >
          {visible.map((idx, pos) => (
            <div
              key={`${idx}-${TESTIMONIALS[idx].name}`}
              className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              <TestimonialCard
                testimonial={TESTIMONIALS[idx]}
                colorIdx={idx}
                isCenter={pos === 1}
              />
            </div>
          ))}
        </div>

        {/* Mobile single card with touch swipe */}
        <div
          className="md:hidden"
          aria-live="polite"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <TestimonialCard
              testimonial={TESTIMONIALS[active]}
              colorIdx={active}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors"
            aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
          >
            {isPaused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            )}
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === active
                    ? 'w-8 h-2.5 bg-accent-dark shadow-sm shadow-accent-dark/30'
                    : 'w-2.5 h-2.5 bg-border hover:bg-accent-dark/30'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
