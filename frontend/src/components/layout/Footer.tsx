import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/70" role="contentinfo">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold text-accent">Ancer</span>
              <span className="text-2xl font-bold text-white">Larins</span>
            </div>
            <p className="text-sm leading-relaxed">
              Lagos-first premium real estate platform. Discover verified properties
              and trusted agents across Nigeria&apos;s most vibrant city.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-accent text-sm uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/properties?listing_type=rent" className="hover:text-accent transition-colors">Rent</Link></li>
              <li><Link href="/properties?listing_type=sale" className="hover:text-accent transition-colors">Buy</Link></li>
              <li><Link href="/agents" className="hover:text-accent transition-colors">Find Agents</Link></li>
              <li><Link href="/properties" className="hover:text-accent transition-colors">All Properties</Link></li>
            </ul>
          </div>

          {/* Popular Areas */}
          <div>
            <h4 className="font-semibold text-accent text-sm uppercase tracking-wider mb-4">Popular Areas</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/properties?area=lekki" className="hover:text-accent transition-colors">Lekki</Link></li>
              <li><Link href="/properties?area=ikoyi" className="hover:text-accent transition-colors">Ikoyi</Link></li>
              <li><Link href="/properties?area=victoria-island" className="hover:text-accent transition-colors">Victoria Island</Link></li>
              <li><Link href="/properties?area=ikeja" className="hover:text-accent transition-colors">Ikeja</Link></li>
              <li><Link href="/properties?area=yaba" className="hover:text-accent transition-colors">Yaba</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-accent text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} AncerLarins. All rights reserved.</p>
          <p className="text-xs text-white/40">Premium Real Estate, Lagos Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
