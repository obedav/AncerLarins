import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSearch from '@/components/search/HeroSearch';

const POPULAR_AREAS = [
  { name: 'Lekki', description: 'Modern living & beachfront', gradient: 'from-blue-900/80 to-blue-700/60' },
  { name: 'Ikoyi', description: 'Luxury & exclusivity', gradient: 'from-emerald-900/80 to-emerald-700/60' },
  { name: 'Victoria Island', description: 'Business & nightlife hub', gradient: 'from-purple-900/80 to-purple-700/60' },
  { name: 'Yaba', description: 'Tech hub & affordable', gradient: 'from-orange-900/80 to-orange-700/60' },
  { name: 'Ikeja', description: 'City center & commercial', gradient: 'from-rose-900/80 to-rose-700/60' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search', desc: 'Browse thousands of verified properties across Lagos' },
  { step: '02', title: 'View', desc: 'See detailed photos, features, and neighborhood info' },
  { step: '03', title: 'Contact', desc: 'Connect with agents instantly via WhatsApp or call' },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-light)_0%,_transparent_50%)]" />
          <div className="container-app relative py-16 md:py-24 text-center">
            <div className="inline-block bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-accent text-sm font-medium">Lagos-First Real Estate Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Find Your Next Home<br />
              <span className="text-accent">in Lagos</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Premium properties. Verified agents. Connect instantly via WhatsApp.
            </p>

            {/* Search Bar */}
            <HeroSearch />

            <div className="max-w-2xl mx-auto">
              {/* Quick Filters */}
              <div className="flex justify-center gap-3 mt-5">
                <Link
                  href="/properties?listing_type=rent&ref=home"
                  className="bg-white/10 hover:bg-accent/20 text-white hover:text-accent border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  Rent
                </Link>
                <Link
                  href="/properties?listing_type=sale&ref=home"
                  className="bg-white/10 hover:bg-accent/20 text-white hover:text-accent border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  Buy
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <p className="text-3xl font-bold text-accent">10K+</p>
                <p className="text-white/40 text-sm mt-1">Properties</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">500+</p>
                <p className="text-white/40 text-sm mt-1">Verified Agents</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">20+</p>
                <p className="text-white/40 text-sm mt-1">Areas Covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 md:py-20">
          <div className="container-app">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-4">How It Works</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Finding your perfect home in Lagos has never been easier
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-accent-dark">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-muted text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="py-16 md:py-20 bg-surface">
          <div className="container-app">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-4">Popular Areas in Lagos</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Explore the most sought-after neighborhoods
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {POPULAR_AREAS.map((area) => (
                <Link
                  key={area.name}
                  href={`/properties?area=${encodeURIComponent(area.name.toLowerCase().replace(/\s+/g, '-'))}&ref=home`}
                  className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-primary"
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${area.gradient} group-hover:opacity-80 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="font-bold text-lg">{area.name}</h3>
                    <p className="text-white/70 text-xs mt-1 text-center">{area.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="py-16 md:py-20 bg-primary">
          <div className="container-app text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">List Your Property Today</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join hundreds of verified agents on AncerLarins. Reach thousands of potential buyers and tenants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?role=agent"
                className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-xl font-semibold transition-colors text-base"
              >
                Get Started Free
              </Link>
              <Link
                href="/properties"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-colors text-base"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
