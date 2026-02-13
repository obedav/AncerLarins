import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">AncerLarins</h3>
            <p className="text-sm">
              Lagos-first real estate platform. Find your perfect home in Nigeria&apos;s most vibrant city.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties?listing_type=rent" className="hover:text-white">Rent</Link></li>
              <li><Link href="/properties?listing_type=sale" className="hover:text-white">Buy</Link></li>
              <li><Link href="/properties?listing_type=shortlet" className="hover:text-white">Shortlet</Link></li>
              <li><Link href="/neighborhoods" className="hover:text-white">Neighborhoods</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Popular Areas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search?lga=Lekki" className="hover:text-white">Lekki</Link></li>
              <li><Link href="/search?lga=Victoria+Island" className="hover:text-white">Victoria Island</Link></li>
              <li><Link href="/search?lga=Ikeja" className="hover:text-white">Ikeja</Link></li>
              <li><Link href="/search?lga=Ikoyi" className="hover:text-white">Ikoyi</Link></li>
              <li><Link href="/search?lga=Yaba" className="hover:text-white">Yaba</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} AncerLarins. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
