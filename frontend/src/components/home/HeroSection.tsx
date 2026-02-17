'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PropertySearch from './PropertySearch';

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                    */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Stat Card (enhanced with icon + description)                       */
/* ------------------------------------------------------------------ */

function StatCard({
  stat,
  index,
  loaded,
}: {
  stat: typeof STATS[0];
  index: number;
  loaded: boolean;
}) {
  const { count, ref } = useCountUp(stat.value, 2200 + index * 300);

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col items-center text-center py-5 sm:py-6 px-4 sm:px-8 hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-all duration-500 ${
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${900 + index * 120}ms` }}
    >
      {/* Icon */}
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-dark/10 group-hover:bg-accent-dark/15 group-hover:scale-110 transition-all duration-300">
        <svg className="w-4.5 h-4.5 text-accent-dark/80 group-hover:text-accent-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
        </svg>
      </div>

      {/* Number */}
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-accent-dark font-playfair tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-lg font-bold text-accent-dark/70 font-playfair">{stat.suffix}</span>
      </div>

      {/* Label */}
      <span className="mt-1 text-[13px] font-semibold text-text-primary dark:text-white/90">{stat.label}</span>

      {/* Description */}
      <span className="mt-0.5 text-[11px] text-text-muted dark:text-white/50">{stat.desc}</span>

      {/* Divider (desktop) */}
      {index < STATS.length - 1 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block h-12 w-px bg-gradient-to-b from-transparent via-border dark:via-white/[0.08] to-transparent" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Clip-Reveal Line (v0-style headline animation)                     */
/* ------------------------------------------------------------------ */

function RevealLine({
  children,
  loaded,
  delay,
}: {
  children: React.ReactNode;
  loaded: boolean;
  delay: string;
}) {
  return (
    <span className="block overflow-hidden">
      <span
        className="inline-block transition-transform duration-700 ease-out"
        style={{
          transform: loaded ? 'translateY(0)' : 'translateY(100%)',
          transitionDelay: delay,
        }}
      >
        {children}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Rotating Word                                                      */
/* ------------------------------------------------------------------ */

function RotatingWord({ words, interval = 3000 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [animClass, setAnimClass] = useState('hero-word-in');

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimClass('hero-word-out');
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setAnimClass('hero-word-in');
      }, 400);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <>
      <span className="sr-only">Home</span>
      <span aria-hidden="true" className={`inline-block text-accent-dark ${animClass}`}>
        {words[index]}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    value: 10000,
    suffix: '+',
    label: 'Properties',
    desc: 'Active listings across Lagos',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    value: 500,
    suffix: '+',
    label: 'Verified Agents',
    desc: 'Vetted professionals',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    value: 20,
    suffix: '+',
    label: 'Areas Covered',
    desc: 'Neighborhoods mapped',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    value: 2500,
    suffix: '+',
    label: 'Happy Clients',
    desc: 'Five-star experiences',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
];

/* ------------------------------------------------------------------ */
/*  Main Hero Section                                                  */
/* ------------------------------------------------------------------ */

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-dvh w-full overflow-hidden"
      aria-label="Hero"
    >
      {/* ---- BACKGROUND LAYERS ---- */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-section.jpeg"
          alt="Luxury properties in Lagos"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
        />
      </div>

      {/* Overlay stack for depth */}
      <div className="absolute inset-0 bg-white/70 dark:bg-primary/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/40 dark:from-primary dark:via-primary/70 dark:to-primary/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/60 dark:from-primary dark:via-transparent dark:to-primary/60" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Geometric accent circles (desktop) */}
      <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full border border-accent-dark/[0.06] hidden lg:block" />
      <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full border border-accent-dark/[0.04] hidden lg:block" />

      {/* Ambient glow */}
      <div
        className="absolute rounded-full opacity-20 blur-[120px] pointer-events-none transition-opacity duration-1000"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(200,165,92,0.25), transparent 70%)',
          top: '-10%', right: '-5%',
          opacity: loaded ? 0.2 : 0,
        }}
      />

      {/* ---- MAIN CONTENT ---- */}
      <div className="relative z-10 flex min-h-dvh flex-col px-4 pt-24 pb-6 sm:px-6 sm:pt-28 sm:pb-8 lg:px-8 lg:pt-32">
        <div className="mx-auto w-full max-w-7xl flex flex-col flex-1">

          {/* ---- Headline area (centered) ---- */}
          <div className="text-center max-w-4xl mx-auto">

            {/* Eyebrow */}
            <div
              className="flex items-center justify-center gap-3 mb-6 transition-all duration-700"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <span className="h-px w-8 bg-accent-dark/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">
                Lagos Premium Real Estate
              </span>
              <span className="h-px w-8 bg-accent-dark/60" />
            </div>

            {/* Headline — clip-reveal animation */}
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              <RevealLine loaded={loaded} delay="200ms">
                <span className="text-primary dark:text-white">Find Your Perfect</span>
              </RevealLine>
              <RevealLine loaded={loaded} delay="400ms">
                <span className="relative inline-block">
                  <span className="relative z-10">
                    <RotatingWord words={['Apartment', 'Office', 'Shortlet', 'Duplex', 'Studio']} />
                  </span>
                  {/* Gold underline brush effect */}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-2.5 bg-accent-dark/15 rounded-full -z-0 origin-left transition-transform duration-700"
                    style={{
                      transitionDelay: '900ms',
                      transform: loaded ? 'scaleX(1)' : 'scaleX(0)',
                    }}
                  />
                </span>
                {' '}
                <span className="text-primary dark:text-white">in Lagos</span>
              </RevealLine>
            </h1>

            {/* Subtitle */}
            <p
              className="max-w-2xl mx-auto text-base leading-relaxed text-text-secondary dark:text-white/70 lg:text-lg transition-all duration-700"
              style={{
                transitionDelay: '500ms',
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              Explore an exclusive collection of verified properties across
              Lagos&apos;s most prestigious neighborhoods, from Banana Island
              estates to Victoria Island penthouses.
            </p>
          </div>

          {/* ---- Multi-Field Search (full width) ---- */}
          <div
            className="relative z-20 w-full mt-6 sm:mt-8 lg:mt-10 transition-all duration-700"
            style={{
              transitionDelay: '600ms',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <PropertySearch />
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-6 sm:min-h-8 lg:min-h-10" />

          {/* ---- Stats Row ---- */}
          <div className="w-full">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.03] backdrop-blur-xl">
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-accent-dark/20 to-transparent" />

              <div className="grid grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat, i) => (
                  <StatCard key={stat.label} stat={stat} index={i} loaded={loaded} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Scroll indicator ---- */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-all duration-700"
        style={{ transitionDelay: '1200ms', opacity: loaded ? 1 : 0 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-text-muted dark:text-white/50">
          Scroll
        </span>
        <svg className="w-4 h-4 text-accent-dark/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ---- Bottom fade ---- */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
