'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const AREAS = [
  {
    name: 'Lekki',
    description: 'Modern living & beachfront',
    image: '/images/neighborhoods/lekki.jpg',
    properties: '2,400+',
    slug: 'lekki',
  },
  {
    name: 'Ikoyi',
    description: 'Luxury & exclusivity',
    image: '/images/neighborhoods/ikoyi.jpg',
    properties: '1,800+',
    slug: 'ikoyi',
  },
  {
    name: 'Victoria Island',
    description: 'Business & nightlife',
    image: '/images/neighborhoods/victoria-island.jpg',
    properties: '2,100+',
    slug: 'victoria-island',
  },
  {
    name: 'Yaba',
    description: 'Tech hub & affordable',
    image: '/images/neighborhoods/yaba.jpg',
    properties: '1,200+',
    slug: 'yaba',
  },
  {
    name: 'Ikeja',
    description: 'City center & commercial',
    image: '/images/neighborhoods/ikeja.jpg',
    properties: '1,500+',
    slug: 'ikeja',
  },
];

export default function PopularAreas() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background" aria-label="Popular areas" ref={ref}>
      <div className="container-app">
        <div className="text-center mb-12 reveal-up" data-visible={isVisible}>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Popular Areas in Lagos
          </h2>
          <p className="text-text-muted mt-2 max-w-lg mx-auto">
            Explore the most sought-after neighborhoods
          </p>
        </div>

        {/* Staggered grid: row 1 = 2 large, row 2 = 3 standard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
          {AREAS.slice(0, 2).map((area, i) => (
            <Link
              key={area.name}
              href={`/properties?area=${area.slug}&ref=home`}
              className={`group relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] reveal-scale stagger-${i + 1}`}
              data-visible={isVisible}
            >
              <Image
                src={area.image}
                alt={`Properties in ${area.name}, Lagos`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-white text-xl md:text-2xl font-bold">{area.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{area.description}</p>
                  </div>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    {area.properties} listings
                  </span>
                </div>
              </div>

              {/* Bottom gold accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent-dark to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS.slice(2).map((area, i) => (
            <Link
              key={area.name}
              href={`/properties?area=${area.slug}&ref=home`}
              className={`group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[4/3] reveal-scale stagger-${i + 3}`}
              data-visible={isVisible}
            >
              <Image
                src={area.image}
                alt={`Properties in ${area.name}, Lagos`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 50vw"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="text-white text-lg font-bold">{area.name}</h3>
                <p className="text-white/70 text-xs mt-0.5">{area.description}</p>
                <span className="mt-2 bg-white/10 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 w-fit">
                  {area.properties} listings
                </span>
              </div>

              {/* Bottom gold accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent-dark to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
