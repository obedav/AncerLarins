import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for using the AncerLarins real estate platform.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-primary py-12">
          <div className="container-app">
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-white/60 mt-2">Last updated: February 2026</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container-app">
            <div className="max-w-3xl mx-auto prose-custom">
              <div className="bg-surface rounded-xl border border-border p-6 md:p-8 space-y-8 text-sm text-text-secondary leading-relaxed">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using AncerLarins (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, you should not use the Platform. These terms apply to all users including browsers, tenants, buyers, agents, and administrators.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">2. Platform Description</h2>
                  <p>
                    AncerLarins is a real estate listing platform focused on Lagos, Nigeria. We connect property seekers with verified agents. We do not own, manage, or control any properties listed on the Platform. We are a technology platform that facilitates connections between parties.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">3. User Accounts</h2>
                  <p className="mb-2">When you create an account, you agree to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your phone number and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Not create multiple accounts for deceptive purposes</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">4. Agent Obligations</h2>
                  <p className="mb-2">Agents listing properties on AncerLarins must:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provide truthful and accurate property information</li>
                    <li>Use real, unedited photographs of the actual property</li>
                    <li>Respond to inquiries in a timely and professional manner</li>
                    <li>Comply with all applicable Nigerian real estate laws and regulations</li>
                    <li>Not post duplicate or misleading listings</li>
                    <li>Complete the verification process honestly</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">5. Prohibited Conduct</h2>
                  <p className="mb-2">You agree not to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Post fraudulent, misleading, or illegal property listings</li>
                    <li>Harass, threaten, or deceive other users</li>
                    <li>Scrape, crawl, or extract data from the Platform without permission</li>
                    <li>Circumvent security measures or access unauthorized areas</li>
                    <li>Use the Platform for money laundering or any unlawful activity</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">6. AncerEstimate Disclaimer</h2>
                  <p>
                    The AncerEstimate feature provides automated property valuations for informational purposes only. These estimates are not professional appraisals and should not be relied upon for financial decisions. Actual property values may differ significantly. We recommend consulting a qualified property valuer before making purchase decisions.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">7. Content Ownership</h2>
                  <p>
                    Users retain ownership of content they upload (photos, descriptions, reviews). By posting content, you grant AncerLarins a non-exclusive, royalty-free license to display and distribute that content on the Platform. We may remove content that violates these terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">8. Limitation of Liability</h2>
                  <p>
                    AncerLarins acts as an intermediary and is not a party to any transaction between users. We are not liable for the quality, safety, or legality of properties listed, the truth or accuracy of listings, or the ability of agents to complete transactions. Use the Platform at your own discretion.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">9. Termination</h2>
                  <p>
                    We may suspend or terminate your account at any time if you violate these terms, engage in fraudulent activity, or for any other reason at our discretion. You may delete your account at any time through your dashboard settings.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">10. Changes to Terms</h2>
                  <p>
                    We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance. We will notify users of material changes via the Platform or email.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">11. Governing Law</h2>
                  <p>
                    These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-text-muted">
                    If you have questions about these terms, contact us at <a href="mailto:legal@ancerlarins.com" className="text-primary hover:underline">legal@ancerlarins.com</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
