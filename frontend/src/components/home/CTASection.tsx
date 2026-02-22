'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function useCountUp(end: number, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

const STATS = [
  { value: 10, suffix: '+', label: 'Years of experience' },
  { value: 20, suffix: '+', label: 'Awards Gained' },
  { value: 879, suffix: '+', label: 'Properties Sold' },
];

export default function CTASection() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" aria-label="Dream space" ref={sectionRef}>
      {/* Background image */}
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
      <div className="absolute inset-0 bg-primary/80" />
      {/* Gold radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(201,168,76,0.12)_0%,_transparent_60%)]" />

      <div className="container-app relative">
        <div className="max-w-2xl reveal-left" data-visible={isVisible}>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-playfair leading-tight mb-6">
            Find real estate<br />
            and get your<br />
            <span className="text-accent">dream space.</span>
          </h2>

          <p className="text-white/50 max-w-md mb-10 leading-relaxed">
            AncerLarins is Nigeria&apos;s premium property concierge — connecting
            discerning buyers with luxury homes through curated private viewings.
          </p>

          <Link
            href="/properties"
            className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            Browse Properties
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/10 reveal-up" data-visible={isVisible}>
          {STATS.map((stat, i) => (
            <StatBlock key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBlock({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value, 2200 + index * 300);

  return (
    <div ref={ref} className="text-center md:text-left">
      <div className="flex items-baseline gap-0.5 justify-center md:justify-start">
        <span className="text-3xl md:text-5xl font-bold text-accent font-playfair tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-xl md:text-3xl font-bold text-accent/60 font-playfair">{stat.suffix}</span>
      </div>
      <p className="text-white/40 text-sm mt-1">{stat.label}</p>
    </div>
  );
}
