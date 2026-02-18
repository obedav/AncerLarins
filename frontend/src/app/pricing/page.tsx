import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Agent Pricing Plans',
  description: 'Choose the right AncerLarins plan for your real estate business. From free to enterprise, we have a plan that fits your needs.',
  openGraph: {
    title: 'Agent Pricing Plans | AncerLarins',
    description: 'List your properties on Lagos\'s premium real estate platform. Plans start from free.',
  },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container-app text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agent Pricing Plans
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your real estate business. Start free and upgrade as you grow.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-app">
            <PricingContent />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
