import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the AncerLarins real estate platform. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-primary py-12">
          <div className="container-app">
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-white/60 mt-2">Last updated: February 2026</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container-app">
            <div className="max-w-3xl mx-auto">
              <div className="bg-surface rounded-xl border border-border p-6 md:p-8 space-y-8 text-sm text-text-secondary leading-relaxed">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">1. Information We Collect</h2>
                  <p className="mb-3">We collect the following types of information:</p>
                  <h3 className="font-semibold text-text-primary mb-1">Account Information</h3>
                  <p className="mb-3">
                    When you sign up, we collect your name, phone number, and optionally your email address. Agents also provide business details, office address, and verification documents.
                  </p>
                  <h3 className="font-semibold text-text-primary mb-1">Usage Data</h3>
                  <p className="mb-3">
                    We automatically collect information about how you use the Platform, including pages viewed, properties searched, and features used. This helps us improve the service.
                  </p>
                  <h3 className="font-semibold text-text-primary mb-1">Property Information</h3>
                  <p>
                    Agents provide property details, photos, pricing, and location data when creating listings. This information is made publicly available on the Platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>To provide, maintain, and improve the Platform</li>
                    <li>To verify agent identities and maintain trust</li>
                    <li>To connect property seekers with agents (lead generation)</li>
                    <li>To send notifications about inquiries, property updates, and saved searches</li>
                    <li>To generate aggregated market insights (AncerEstimate, neighborhood scores)</li>
                    <li>To detect and prevent fraud or abuse</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">3. Information Sharing</h2>
                  <p className="mb-3">We share your information only in these circumstances:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Agent-Seeker Connection:</strong> When you contact an agent, your name and contact method are shared with that agent</li>
                    <li><strong>Public Listings:</strong> Property details, photos, and agent business information are publicly visible</li>
                    <li><strong>Service Providers:</strong> We use third-party services for hosting, analytics, and communication (e.g., cloud providers, SMS gateways)</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-3">We do not sell your personal information to third parties.</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">4. Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your data, including encrypted connections (HTTPS), secure password hashing, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">5. Data Retention</h2>
                  <p>
                    We retain your account data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where retention is required by law. Aggregated, anonymized data (used for market insights) may be retained indefinitely.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">6. Your Rights</h2>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Access your personal data stored on the Platform</li>
                    <li>Update or correct your information through your profile settings</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of non-essential notifications</li>
                    <li>Request a copy of your data in a portable format</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">7. Cookies and Tracking</h2>
                  <p>
                    We use essential cookies for authentication and session management. We may use analytics tools to understand Platform usage patterns. We do not use third-party advertising trackers.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">8. Children&apos;s Privacy</h2>
                  <p>
                    AncerLarins is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">9. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant changes through the Platform or via your registered contact information.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">10. Nigeria Data Protection</h2>
                  <p>
                    This policy is designed to comply with the Nigeria Data Protection Regulation (NDPR) and the Nigeria Data Protection Act 2023. Our data processing practices align with the principles of lawfulness, fairness, transparency, purpose limitation, and data minimization.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-text-muted">
                    For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@ancerlarins.com" className="text-primary hover:underline">privacy@ancerlarins.com</a>.
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
