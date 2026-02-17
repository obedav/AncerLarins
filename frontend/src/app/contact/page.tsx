import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the AncerLarins team. Reach us via WhatsApp, email, or visit our office in Lagos.',
};

const CONTACT_METHODS = [
  {
    title: 'WhatsApp',
    desc: 'Chat with our support team directly',
    value: '+234 800 ANCER',
    href: 'https://wa.me/2348000000000',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: 'text-[#25D366]',
  },
  {
    title: 'Email',
    desc: 'For business inquiries and partnerships',
    value: 'hello@ancerlarins.com',
    href: 'mailto:hello@ancerlarins.com',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    color: 'text-primary',
  },
  {
    title: 'Office',
    desc: 'Visit us in Lagos',
    value: 'Lagos, Nigeria',
    href: null,
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'text-accent-dark',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How do I list my property?',
    a: 'Sign up as an agent, complete your profile verification, then click "List a New Property" from your dashboard. It\'s free to get started.',
  },
  {
    q: 'Are agents verified?',
    a: 'Yes. Every agent on AncerLarins goes through a verification process. Look for the green verified badge on agent profiles.',
  },
  {
    q: 'How does AncerEstimate work?',
    a: 'AncerEstimate uses area pricing data and comparable properties to provide automated valuations. It helps you understand if a listing is fairly priced.',
  },
  {
    q: 'Is AncerLarins free for tenants and buyers?',
    a: 'Yes, browsing and contacting agents is completely free. We never charge tenants or buyers for using the platform.',
  },
  {
    q: 'How do I report a fraudulent listing?',
    a: 'Use the "Report" button on any property page, or contact our support team via WhatsApp. We investigate all reports promptly.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container-app text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Have a question, suggestion, or need help? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container-app">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {CONTACT_METHODS.map((method) => (
                <div key={method.title} className="bg-surface rounded-2xl border border-border p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mx-auto mb-4">
                    <svg className={`w-6 h-6 ${method.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={method.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{method.title}</h3>
                  <p className="text-sm text-text-muted mb-3">{method.desc}</p>
                  {method.href ? (
                    <a
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : undefined}
                      rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-text-secondary">{method.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-surface">
          <div className="container-app">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-3">Frequently Asked Questions</h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              Quick answers to common questions
            </p>
            <div className="max-w-3xl mx-auto space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className="bg-background rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-text-primary mb-2">{item.q}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container-app text-center">
            <h2 className="text-xl font-bold text-text-primary mb-3">Can&apos;t find what you need?</h2>
            <p className="text-text-muted mb-6">Browse our properties or reach out directly.</p>
            <Link href="/properties" className="bg-primary hover:bg-primary-light text-white px-8 py-3.5 rounded-xl font-semibold transition-colors inline-block">
              Browse Properties
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
