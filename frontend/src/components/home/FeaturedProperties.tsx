'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/property/PropertyCard';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function CardSkeleton() {
  return (
    <div className="min-w-[280px] sm:min-w-[300px] snap-start">
      <div className="bg-surface rounded-2xl overflow-hidden border border-border animate-pulse">
        <div className="aspect-[4/3] bg-border/40" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-border/40 rounded w-1/2" />
          <div className="h-4 bg-border/40 rounded w-3/4" />
          <div className="h-4 bg-border/40 rounded w-2/3" />
          <div className="flex gap-4 pt-3 border-t border-border">
            <div className="h-4 bg-border/40 rounded w-16" />
            <div className="h-4 bg-border/40 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProperties() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoplayRef = useRef<ReturnType<typeof setInterval>>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { data, isLoading } = useGetPropertiesQuery({ per_page: 12, sort_by: 'newest' });
  const properties = data?.data || [];

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  }, []);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (isPaused || properties.length === 0) return;

    autoplayRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 4000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, properties.length, scroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState, properties]);

  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-14 md:py-20 bg-background" aria-label="Featured properties">
      <div className="container-app">
        {/* Header */}
        <div ref={sectionRef} className="flex items-end justify-between mb-8">
          <div className="reveal-left" data-visible={isVisible}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent-dark bg-accent-dark/10 px-3 py-1 rounded-full mb-3">
              Just Listed
            </span>
            <div className="flex items-start gap-3">
              <div className="w-1 h-10 bg-accent-dark rounded-full shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Featured Properties
                </h2>
                <p className="text-text-muted mt-1">
                  Fresh properties added by verified agents
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors"
              aria-label={isPaused ? 'Play auto-scroll' : 'Pause auto-scroll'}
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
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="hidden sm:flex w-10 h-10 rounded-full border border-border bg-surface items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="hidden sm:flex w-10 h-10 rounded-full border border-border bg-surface items-center justify-center text-text-secondary hover:border-accent-dark hover:text-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 carousel-fade-right"
          role="region"
          aria-label="Property carousel"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : properties.length === 0
              ? (
                <div className="flex items-center justify-center w-full py-12 text-text-muted">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm font-medium">No properties available yet</p>
                    <p className="text-xs mt-1">Check back soon for new listings</p>
                  </div>
                </div>
              )
              : properties.map((property) => (
                  <div key={property.id} className="min-w-[280px] sm:min-w-[300px] max-w-[320px] snap-start flex-shrink-0">
                    <PropertyCard property={property} source="homepage_featured" />
                  </div>
                ))
          }
        </div>

        {/* View All link */}
        <div className="mt-8 text-center">
          <Link
            href="/properties?sort_by=newest"
            className="inline-flex items-center gap-2 text-accent-dark hover:text-accent font-semibold transition-colors group"
          >
            View All Properties
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
