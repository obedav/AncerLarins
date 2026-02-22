'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useGetPropertiesQuery } from '@/store/api/propertyApi';
import { formatPrice } from '@/lib/utils';
import type { PropertyListItem } from '@/types';

interface LocationData {
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  areaSlug: string;
  highlights: string[];
  avgPrice: string;
  priceRange: string;
  lifestyle: string;
}

const LOCATIONS: Record<string, LocationData> = {
  ikoyi: {
    name: 'Ikoyi',
    tagline: 'Old money meets modern luxury',
    description:
      'Ikoyi is the crown jewel of Lagos real estate — a serene, tree-lined enclave where Nigeria\'s elite have lived for decades. From restored colonial mansions to sleek waterfront penthouses, Ikoyi offers an unmatched blend of heritage, privacy, and prestige.',
    heroImage: '/images/neighborhoods/ikoyi.jpg',
    areaSlug: 'ikoyi',
    highlights: [
      'Minutes from Victoria Island\'s business district',
      'Home to the Ikoyi Club and Lagos Polo Club',
      'Proximity to Falomo Bridge and Third Mainland Bridge',
      '24/7 security in most estates',
      'Premium international schools nearby',
    ],
    avgPrice: '₦350M - ₦1.5B',
    priceRange: 'Luxury tier',
    lifestyle:
      'Quiet tree-lined streets, world-class restaurants at Awolowo Road, evening walks along the waterfront. Ikoyi is for those who value discretion, space, and legacy.',
  },
  'banana-island': {
    name: 'Banana Island',
    tagline: 'Africa\'s most exclusive address',
    description:
      'Banana Island is a man-made peninsula off Ikoyi — a gated, ultra-secure enclave housing Nigeria\'s billionaires, diplomats, and captains of industry. Every residence here is a statement: waterfront mansions, rooftop infinity pools, private jetties, and 24/7 security that rivals any compound in the world.',
    heroImage: '/images/neighborhoods/ikoyi.jpg',
    areaSlug: 'banana-island',
    highlights: [
      'Fully gated and guarded peninsula',
      'Waterfront properties with Lagos Lagoon views',
      'Private jetties and helipads',
      'Underground utilities — zero overhead cables',
      'Home to some of Africa\'s most valuable real estate',
    ],
    avgPrice: '₦800M - ₦5B+',
    priceRange: 'Ultra-luxury',
    lifestyle:
      'The ultimate in Nigerian luxury living. Absolute privacy, lagoon views from every angle, and a community of the continent\'s most accomplished individuals.',
  },
  'victoria-island': {
    name: 'Victoria Island',
    tagline: 'Where business meets the waterfront',
    description:
      'Victoria Island is Lagos\'s commercial heartbeat — a vibrant island packed with multinational headquarters, five-star hotels, fine-dining restaurants, and luxury high-rises. It\'s where deals close by day and the nightlife unfolds by night.',
    heroImage: '/images/neighborhoods/victoria-island.jpg',
    areaSlug: 'victoria-island',
    highlights: [
      'Central business district of Lagos',
      'Walking distance to Eko Atlantic City',
      'Premium serviced apartments and corporate housing',
      'Lagos\'s best restaurants: Nok, The Terrace, Noir',
      'Close to Bar Beach and the Atlantic coastline',
    ],
    avgPrice: '₦150M - ₦800M',
    priceRange: 'Premium to luxury',
    lifestyle:
      'Fast-paced, cosmopolitan, electric. Victoria Island is for professionals and investors who want to live at the centre of Lagos\'s economy, with the ocean at their doorstep.',
  },
  'lekki-phase-1': {
    name: 'Lekki Phase 1',
    tagline: 'The new face of Lagos luxury',
    description:
      'Lekki Phase 1 is a masterplanned, gated estate that has become one of Lagos\'s most desirable addresses. With wide, well-paved roads, modern infrastructure, and a growing collection of high-end developments, it offers the perfect balance of suburban peace and urban convenience.',
    heroImage: '/images/neighborhoods/lekki.jpg',
    areaSlug: 'lekki',
    highlights: [
      'Gated estate with controlled access points',
      'Well-planned road network with street lights',
      'Close to Lekki Conservation Centre',
      'Thriving commercial corridor on Admiralty Way',
      'New luxury towers and smart homes under construction',
    ],
    avgPrice: '₦100M - ₦500M',
    priceRange: 'Premium',
    lifestyle:
      'Modern, organized, and family-friendly. Lekki Phase 1 is where young professionals and established families find world-class living without the congestion of the islands.',
  },
  maitama: {
    name: 'Maitama',
    tagline: 'Abuja\'s most prestigious district',
    description:
      'Maitama is to Abuja what Ikoyi is to Lagos — the undisputed address of power, diplomacy, and privilege. Nestled against the lush hills of Nigeria\'s capital, Maitama houses embassies, ministers\' residences, and some of the country\'s most architecturally stunning homes.',
    heroImage: '/images/neighborhoods/ikoyi.jpg',
    areaSlug: 'maitama',
    highlights: [
      'Home to most foreign embassies in Abuja',
      'Minutes from the Presidential Villa',
      'Hilltop mansions with panoramic city views',
      'Excellent security and infrastructure',
      'Adjacent to Wuse 2 shopping and entertainment',
    ],
    avgPrice: '₦200M - ₦1.2B',
    priceRange: 'Luxury',
    lifestyle:
      'Diplomatic elegance, hilltop serenity, and proximity to the corridors of power. Maitama is for those who move nations.',
  },
};

function PropertyCard({ property }: { property: PropertyListItem }) {
  const coverImage = property.cover_image?.url || property.cover_image?.thumbnail_url || '';

  return (
    <div className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-accent/30 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[#2A2A2A] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#3A3A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 13.5V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v7.5" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-accent text-xl font-bold">{formatPrice(property.price_kobo)}</span>
        </div>
        <p className="text-white/50 text-sm truncate mb-3">{property.title}</p>
        <Link
          href={`/properties/${property.slug}`}
          className="block w-full text-center bg-accent/10 hover:bg-accent hover:text-primary border border-accent/40 text-accent py-2.5 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300"
        >
          Request Viewing
        </Link>
      </div>
    </div>
  );
}

export default function LocationPage() {
  const params = useParams();
  const slug = params.slug as string;
  const location = LOCATIONS[slug];

  const { data, isLoading } = useGetPropertiesQuery(
    location ? { per_page: 6, area: location.areaSlug, sort_by: 'newest' } : undefined,
    { skip: !location },
  );
  const properties = data?.data || [];

  if (!location) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative -mt-20 min-h-[70dvh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={location.heroImage}
              alt={location.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />
          </div>
          <div className="relative container-app pb-16 pt-32">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              {location.priceRange}
            </span>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-white mb-3">
              {location.name}
            </h1>
            <p className="text-xl text-accent font-medium mb-4">{location.tagline}</p>
            <p className="text-white/60 max-w-xl leading-relaxed">{location.description}</p>
          </div>
        </section>

        {/* Key Details */}
        <section className="py-16 bg-surface">
          <div className="container-app">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Highlights */}
              <div>
                <h2 className="text-2xl font-bold text-white font-playfair mb-6">Why {location.name}?</h2>
                <ul className="space-y-3">
                  {location.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/70 text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price + Lifestyle */}
              <div className="space-y-6">
                <div className="bg-primary border border-[#2A2A2A] rounded-2xl p-6">
                  <p className="text-xs font-bold text-accent tracking-widest uppercase mb-2">Price Range</p>
                  <p className="text-2xl font-bold text-white font-playfair">{location.avgPrice}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">The Lifestyle</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{location.lifestyle}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Properties */}
        <section className="py-16 bg-primary">
          <div className="container-app">
            <h2 className="text-2xl font-bold text-white font-playfair mb-8">
              Available in {location.name}
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] animate-pulse">
                    <div className="aspect-[4/3] bg-[#2A2A2A]" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-[#2A2A2A] rounded w-1/2" />
                      <div className="h-4 bg-[#2A2A2A] rounded w-3/4" />
                      <div className="h-11 bg-[#2A2A2A] rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-[#2A2A2A]">
                <p className="text-white/40 text-sm mb-4">No properties available in {location.name} right now.</p>
                <Link
                  href="/properties"
                  className="text-accent hover:text-accent-dark font-semibold text-sm uppercase tracking-wider"
                >
                  Browse All Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 6).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                href={`/properties?area=${location.areaSlug}`}
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-semibold transition-colors group uppercase tracking-wider text-sm"
              >
                View All in {location.name}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-surface">
          <div className="container-app text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-playfair mb-4">
              Interested in {location.name}?
            </h2>
            <p className="text-white/50 max-w-md mx-auto mb-8">
              Our concierge team specializes in {location.name} properties. Request a private viewing and we&apos;ll handle everything.
            </p>
            <Link
              href="/properties"
              className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              Request Private Viewing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
