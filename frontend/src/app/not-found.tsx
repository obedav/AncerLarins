import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
          <p className="text-lg text-text-secondary mb-1">Page not found</p>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Go Home
            </Link>
            <Link href="/properties" className="bg-surface border border-border hover:border-accent-dark text-text-primary px-6 py-3 rounded-xl font-semibold transition-colors">
              Browse Properties
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
