import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSearch from '@/components/search/HeroSearch';
import RotatingText from '@/components/ui/RotatingText';

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

const TRUST_ITEMS = [
  { label: 'Verified agents only', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { label: 'Real photos & data', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Instant WhatsApp', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { label: 'No hidden fees', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-primary relative overflow-hidden">
          {/* Layered gradients for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-light)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(240,217,160,0.06)_0%,_transparent_40%)]" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

          <div className="container-app relative py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-sm font-medium">Lagos-First Real Estate Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Find Your Perfect<br />
              <RotatingText
                words={['Apartment', 'Duplex', 'Penthouse', 'Land', 'Office']}
                className="text-accent"
              />{' '}
              <span className="text-accent">in Lagos</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Premium properties. Verified agents. Connect instantly via WhatsApp.
            </p>

            {/* Search Bar */}
            <HeroSearch />

            <div className="max-w-2xl mx-auto">
              {/* Quick Filters */}
              <div className="flex justify-center gap-3 mt-6">
                <Link
                  href="/properties?listing_type=rent&ref=home"
                  className="group bg-white/10 hover:bg-accent/20 text-white hover:text-accent border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Rent
                  </span>
                </Link>
                <Link
                  href="/properties?listing_type=sale&ref=home"
                  className="group bg-white/10 hover:bg-accent/20 text-white hover:text-accent border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Buy
                  </span>
                </Link>
                <Link
                  href="/properties?listing_type=short_let&ref=home"
                  className="group bg-white/10 hover:bg-accent/20 text-white hover:text-accent border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Short Let
                  </span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 flex justify-center">
              <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
                <div className="bg-primary px-8 py-5 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent">10K+</p>
                  <p className="text-white/40 text-sm mt-1">Properties</p>
                </div>
                <div className="bg-primary px-8 py-5 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent">500+</p>
                  <p className="text-white/40 text-sm mt-1">Verified Agents</p>
                </div>
                <div className="bg-primary px-8 py-5 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent">20+</p>
                  <p className="text-white/40 text-sm mt-1">Areas Covered</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="bg-surface border-b border-border">
          <div className="container-app py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-text-muted">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 md:py-20">
          <div className="container-app">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-3">How It Works</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Finding your perfect home in Lagos has never been easier
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={item.step} className="relative group">
                  <div className="bg-surface rounded-2xl border border-border p-6 text-center hover:border-accent/30 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-accent-dark/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-dark/15 transition-colors">
                      <svg className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-accent-dark tracking-widest uppercase mb-2 block">Step {item.step}</span>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  {/* Connecting arrow (desktop only, not on last item) */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <svg className="w-8 h-8 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="py-16 md:py-20 bg-surface">
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
                  className="group relative bg-primary rounded-2xl overflow-hidden h-44 md:h-52 hover:shadow-xl transition-shadow"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary-light/40 group-hover:from-primary-dark transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={area.icon} />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg">{area.name}</h3>
                    <p className="text-white/60 text-xs mt-1 text-center">{area.description}</p>
                    <span className="mt-3 text-xs text-accent/80 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      View Properties &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(240,217,160,0.08)_0%,_transparent_60%)]" />
          <div className="container-app text-center relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">List Your Property Today</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
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
