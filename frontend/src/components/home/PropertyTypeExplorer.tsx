'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PATHWAYS = [
  {
    title: 'Rent',
    description: 'Apartments, duplexes, self-contains, and houses for rent across Lagos — with annual and monthly pricing options.',
    cta: 'Browse Rentals',
    href: '/properties?listing_type=rent',
    image: '/images/home/rent-property.jpg',
    features: ['Annual & monthly pricing', 'Furnished options', 'Area insights'],
    icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
  },
  {
    title: 'Buy',
    description: 'Homes and land for sale with AncerEstimate valuations and neighborhood scores to guide your decision.',
    cta: 'Browse For Sale',
    href: '/properties?listing_type=sale',
    image: '/images/home/buy-property.jpg',
    features: ['AncerEstimate valuations', 'Neighborhood scores', 'Market comparisons'],
    icon: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    title: 'Short Let',
    description: 'Furnished apartments for business trips, relocations, or short stays — with daily pricing and flexible check-in.',
    cta: 'Browse Short Lets',
    href: '/properties?listing_type=short_let',
    image: '/images/home/shortlet-property.jpg',
    features: ['Daily pricing', 'Furnished & serviced', 'Flexible dates'],
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
];

export default function PropertyTypeExplorer() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-14 md:py-20 bg-background" aria-label="Browse by listing type" ref={ref}>
      <div className="container-app">
        <div className="text-center mb-10 reveal-up" data-visible={isVisible}>
          <span className="text-xs font-bold text-accent-dark tracking-widest uppercase">Start Here</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-2">
            What Are You Looking For?
          </h2>
          <p className="text-text-muted mt-2 max-w-lg mx-auto">
            Three ways to find your next property in Lagos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {PATHWAYS.map((pathway, i) => (
            <div
              key={pathway.title}
              className={`group relative rounded-2xl overflow-hidden reveal-scale stagger-${i + 1}`}
              data-visible={isVisible}
            >
              {/* Photo background */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4]">
                <Image
                  src={pathway.image}
                  alt={`${pathway.title} properties in Lagos`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 transition-colors duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center mb-4 group-hover:bg-accent-dark/20 group-hover:border-accent-dark/30 transition-colors">
                    <svg className="w-5 h-5 text-white group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={pathway.icon} />
                    </svg>
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-xl font-bold mb-2">{pathway.title}</h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {pathway.description}
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {pathway.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-[11px] font-medium text-white/80 bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={pathway.href}
                    className="inline-flex items-center justify-center gap-2 bg-accent-dark hover:bg-accent text-primary px-5 py-3 rounded-xl font-semibold text-sm transition-colors w-full"
                  >
                    {pathway.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Bottom gold accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent-dark to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
