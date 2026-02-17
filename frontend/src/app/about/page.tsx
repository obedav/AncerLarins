import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'AncerLarins is Lagos\'s premium real estate platform connecting buyers, tenants, and verified agents across Nigeria\'s most vibrant city.',
};

const TEAM_VALUES = [
  {
    title: 'Transparency',
    desc: 'Every listing is reviewed. Every agent is verified. No hidden fees, no surprises.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Lagos-First',
    desc: 'Built for the Nigerian market. We understand local pricing, neighborhoods, and how deals get done.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Speed',
    desc: 'Contact agents instantly via WhatsApp. No forms, no waiting, no middlemen slowing you down.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Intelligence',
    desc: 'AncerEstimate valuations, neighborhood scores, and market trends help you make informed decisions.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container-app text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">About AncerLarins</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We&apos;re building the most trusted real estate platform in Lagos &mdash; where verified agents, real data, and instant communication meet.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container-app">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                Finding a home in Lagos shouldn&apos;t be stressful. Yet for millions of Nigerians, the process involves unreliable listings, unverified agents, and opaque pricing. AncerLarins was built to change that.
              </p>
              <p className="text-text-secondary leading-relaxed mb-6">
                We combine technology with local market expertise to give you real property data, verified agents you can trust, and instant communication through WhatsApp &mdash; the way Nigerians actually do business.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Whether you&apos;re renting your first apartment in Yaba, buying a duplex in Lekki, or listing properties as an agent, AncerLarins gives you the tools and confidence to make the right move.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-surface">
          <div className="container-app">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {TEAM_VALUES.map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-dark/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={value.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{value.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container-app">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
              <div>
                <p className="text-3xl font-bold text-accent-dark">10K+</p>
                <p className="text-sm text-text-muted mt-1">Properties Listed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-dark">500+</p>
                <p className="text-sm text-text-muted mt-1">Verified Agents</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-dark">20+</p>
                <p className="text-sm text-text-muted mt-1">Lagos Areas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-dark">50K+</p>
                <p className="text-sm text-text-muted mt-1">Monthly Visitors</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="container-app text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Whether you&apos;re looking for a property or listing one, AncerLarins has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="bg-accent hover:bg-accent-dark text-primary px-8 py-3.5 rounded-xl font-semibold transition-colors">
                Browse Properties
              </Link>
              <Link href="/register?role=agent" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-colors">
                List as Agent
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
