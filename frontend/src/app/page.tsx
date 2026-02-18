import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import PropertyTypeExplorer from '@/components/home/PropertyTypeExplorer';
import WhyAncerLarins from '@/components/home/WhyAncerLarins';
import Testimonials from '@/components/home/Testimonials';

const POPULAR_AREAS = [
  { name: 'Lekki', description: 'Modern living & beachfront', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Ikoyi', description: 'Luxury & exclusivity', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { name: 'Victoria Island', description: 'Business & nightlife', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Yaba', description: 'Tech hub & affordable', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { name: 'Ikeja', description: 'City center & commercial', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search',
    desc: 'Browse thousands of verified properties across Lagos neighborhoods',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    step: '02',
    title: 'Explore',
    desc: 'See detailed photos, neighborhood scores, and price estimates',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  {
    step: '03',
    title: 'Connect',
    desc: 'Reach verified agents instantly via WhatsApp — no waiting',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* Premium Hero */}
        <HeroSection />

        {/* Just Listed — Featured Properties Carousel */}
        <FeaturedProperties />

        {/* How it Works */}
        <section className="py-16 md:py-20 bg-surface" aria-label="How it works">
          <div className="container-app">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-3">How It Works</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Finding your perfect home in Lagos has never been easier
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={item.step} className="relative group">
                  <div className="bg-background rounded-2xl border border-border p-6 text-center hover:border-accent/30 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-accent-dark/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-dark/15 transition-colors">
                      <svg className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-accent-dark tracking-widest uppercase mb-2 block">Step {item.step}</span>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-5 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center">
                      <svg className="w-6 h-6 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore by Property Type */}
        <PropertyTypeExplorer />

        {/* Why AncerLarins */}
        <WhyAncerLarins />

        {/* Popular Areas */}
        <section className="py-16 md:py-20" aria-label="Popular areas">
          <div className="container-app">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-3">Popular Areas in Lagos</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Explore the most sought-after neighborhoods
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {POPULAR_AREAS.map((area) => (
                <Link
                  key={area.name}
                  href={`/properties?area=${encodeURIComponent(area.name.toLowerCase().replace(/\s+/g, '-'))}&ref=home`}
                  className="group relative bg-primary rounded-2xl overflow-hidden aspect-[4/5] transition-all duration-300 hover:shadow-2xl hover:shadow-accent-dark/10 hover:-translate-y-1"
                >
                  {/* Layered gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/90 to-primary-light/50" />
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/[0.06] via-transparent to-accent-dark/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Decorative ring */}
                  <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full border border-white/[0.04] group-hover:border-accent-dark/10 transition-colors duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.08] backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-accent-dark/20 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={area.icon} />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg">{area.name}</h3>
                    <p className="text-white/60 text-xs mt-1 text-center">{area.description}</p>
                    <span className="mt-3 text-xs text-accent font-medium translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      View Properties &rarr;
                    </span>
                  </div>

                  {/* Bottom accent line on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-dark to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Transition gradient into CTA */}
        <div className="h-20 bg-gradient-to-b from-background to-primary" />

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary relative overflow-hidden" aria-label="Call to action">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent)/0.08_0%,_transparent_60%)]" />
          {/* Subtle top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-accent-dark/30 to-transparent" />
          <div className="container-app text-center relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">List Your Property Today</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Join hundreds of verified agents on AncerLarins. Reach thousands of potential buyers and tenants across Lagos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?role=agent"
                className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-xl font-semibold transition-colors text-base inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Get Started Free
              </Link>
              <Link
                href="/properties"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-colors text-base inline-flex items-center justify-center gap-2"
              >
                Browse Properties
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
