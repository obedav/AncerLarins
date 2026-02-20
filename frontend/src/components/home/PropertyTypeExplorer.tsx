'use client';

import Link from 'next/link';
import { useGetPropertyTypesQuery } from '@/store/api/locationApi';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TYPE_ICONS: Record<string, string> = {
  apartment: 'M3 21V3h18v18H3zm2-2h4v-4H5v4zm0-6h4V9H5v4zm0-6h4V3H5v4zm6 12h4v-4h-4v4zm0-6h4V9h-4v4zm0-6h4V3h-4v4zm6 12h4v-4h-4v4zm0-6h4V9h-4v4zm0-6h4V3h-4v4z',
  house: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  duplex: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'semi-detached': 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  terrace: 'M3 21h18M3 18h18M6 18v-7m4 7V8m4 10V8m4 10v-7M3 7l9-4 9 4',
  bungalow: 'M3 12l9-8 9 8M5 10v10h14V10',
  mansion: 'M12 3L2 12h3v8h14v-8h3L12 3zm-2 15v-5h4v5',
  penthouse: 'M3 21h18v-2H3v2zm0-4h18v-2H3v2zm2-4h14V5L12 2 5 5v8zm4-2V7l3-2 3 2v4h-6z',
  'self-contain': 'M4 21V9l8-6 8 6v12H4zm4-5h8v5H8v-5z',
  land: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  'commercial-space': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  office: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  shop: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
};

const TYPE_COLORS = [
  'from-blue-500/15 to-blue-600/5 hover:from-blue-500/25 hover:to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/5 dark:hover:from-blue-400/20 dark:hover:to-blue-500/10',
  'from-emerald-500/15 to-emerald-600/5 hover:from-emerald-500/25 hover:to-emerald-600/10 dark:from-emerald-400/10 dark:to-emerald-500/5 dark:hover:from-emerald-400/20 dark:hover:to-emerald-500/10',
  'from-violet-500/15 to-violet-600/5 hover:from-violet-500/25 hover:to-violet-600/10 dark:from-violet-400/10 dark:to-violet-500/5 dark:hover:from-violet-400/20 dark:hover:to-violet-500/10',
  'from-amber-500/15 to-amber-600/5 hover:from-amber-500/25 hover:to-amber-600/10 dark:from-amber-400/10 dark:to-amber-500/5 dark:hover:from-amber-400/20 dark:hover:to-amber-500/10',
  'from-rose-500/15 to-rose-600/5 hover:from-rose-500/25 hover:to-rose-600/10 dark:from-rose-400/10 dark:to-rose-500/5 dark:hover:from-rose-400/20 dark:hover:to-rose-500/10',
  'from-cyan-500/15 to-cyan-600/5 hover:from-cyan-500/25 hover:to-cyan-600/10 dark:from-cyan-400/10 dark:to-cyan-500/5 dark:hover:from-cyan-400/20 dark:hover:to-cyan-500/10',
  'from-orange-500/15 to-orange-600/5 hover:from-orange-500/25 hover:to-orange-600/10 dark:from-orange-400/10 dark:to-orange-500/5 dark:hover:from-orange-400/20 dark:hover:to-orange-500/10',
  'from-indigo-500/15 to-indigo-600/5 hover:from-indigo-500/25 hover:to-indigo-600/10 dark:from-indigo-400/10 dark:to-indigo-500/5 dark:hover:from-indigo-400/20 dark:hover:to-indigo-500/10',
  'from-teal-500/15 to-teal-600/5 hover:from-teal-500/25 hover:to-teal-600/10 dark:from-teal-400/10 dark:to-teal-500/5 dark:hover:from-teal-400/20 dark:hover:to-teal-500/10',
  'from-pink-500/15 to-pink-600/5 hover:from-pink-500/25 hover:to-pink-600/10 dark:from-pink-400/10 dark:to-pink-500/5 dark:hover:from-pink-400/20 dark:hover:to-pink-500/10',
  'from-lime-500/15 to-lime-600/5 hover:from-lime-500/25 hover:to-lime-600/10 dark:from-lime-400/10 dark:to-lime-500/5 dark:hover:from-lime-400/20 dark:hover:to-lime-500/10',
  'from-fuchsia-500/15 to-fuchsia-600/5 hover:from-fuchsia-500/25 hover:to-fuchsia-600/10 dark:from-fuchsia-400/10 dark:to-fuchsia-500/5 dark:hover:from-fuchsia-400/20 dark:hover:to-fuchsia-500/10',
  'from-sky-500/15 to-sky-600/5 hover:from-sky-500/25 hover:to-sky-600/10 dark:from-sky-400/10 dark:to-sky-500/5 dark:hover:from-sky-400/20 dark:hover:to-sky-500/10',
];

const ICON_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-violet-600 dark:text-violet-400',
  'text-amber-600 dark:text-amber-400',
  'text-rose-600 dark:text-rose-400',
  'text-cyan-600 dark:text-cyan-400',
  'text-orange-600 dark:text-orange-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-teal-600 dark:text-teal-400',
  'text-pink-600 dark:text-pink-400',
  'text-lime-600 dark:text-lime-400',
  'text-fuchsia-600 dark:text-fuchsia-400',
  'text-sky-600 dark:text-sky-400',
];

const FALLBACK_ICON = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

function TypeSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-border/40 mb-3" />
      <div className="h-4 bg-border/40 rounded w-2/3 mb-2" />
      <div className="h-3 bg-border/40 rounded w-1/2" />
    </div>
  );
}

export default function PropertyTypeExplorer() {
  const { data, isLoading } = useGetPropertyTypesQuery();
  const types = data?.data || [];
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-14 md:py-20 bg-background" aria-label="Explore by property type" ref={ref}>
      <div className="container-app">
        <div className="text-center mb-10 reveal-up" data-visible={isVisible}>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Explore by Property Type
          </h2>
          <p className="text-text-muted mt-2 max-w-lg mx-auto">
            Find the perfect space — from cozy apartments to sprawling estates
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <TypeSkeleton key={i} />)
            : types.map((type, i) => {
                const slug = type.slug.toLowerCase();
                const iconPath = TYPE_ICONS[slug] || FALLBACK_ICON;
                const colorIdx = i % TYPE_COLORS.length;
                const isBento = i < 2;

                return (
                  <Link
                    key={type.id}
                    href={`/properties?property_type=${type.slug}`}
                    className={`group relative bg-gradient-to-br ${TYPE_COLORS[colorIdx]} rounded-2xl border border-border/60 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent-dark/5 hover:-translate-y-1 hover:border-accent/30 reveal-scale stagger-${Math.min(i + 1, 5)} ${
                      isBento ? 'lg:col-span-2' : ''
                    }`}
                    data-visible={isVisible}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform ${ICON_COLORS[colorIdx]}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm leading-tight">
                      {type.name}
                    </h3>
                    <span className="text-xs text-text-muted mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}
