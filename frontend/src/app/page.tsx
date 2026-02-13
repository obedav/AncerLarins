import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-800 to-green-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Home in Lagos
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Buy, rent, or shortlet properties across Nigeria&apos;s most vibrant city.
              Thousands of verified listings at your fingertips.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search by location, property type..."
                className="flex-1 px-4 py-3 text-gray-800 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select className="px-4 py-3 text-gray-600 rounded-lg bg-gray-50">
                <option value="">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
                <option value="shortlet">Shortlet</option>
              </select>
              <Link
                href="/search"
                className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 font-medium"
              >
                Search
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-xl mx-auto">
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-green-200 text-sm">Properties</p>
              </div>
              <div>
                <p className="text-3xl font-bold">20+</p>
                <p className="text-green-200 text-sm">LGAs Covered</p>
              </div>
              <div>
                <p className="text-3xl font-bold">5K+</p>
                <p className="text-green-200 text-sm">Happy Tenants</p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Type */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Apartments', type: 'apartment', icon: '🏢' },
                { name: 'Houses', type: 'house', icon: '🏠' },
                { name: 'Duplexes', type: 'duplex', icon: '🏘️' },
                { name: 'Shortlets', type: 'shortlet', icon: '🏨' },
              ].map((cat) => (
                <Link
                  key={cat.type}
                  href={`/search?property_type=${cat.type}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100"
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <p className="mt-2 font-semibold text-gray-800">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Areas in Lagos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['Lekki', 'Victoria Island', 'Ikeja', 'Ikoyi', 'Yaba', 'Surulere', 'Ajah', 'Gbagada', 'Maryland', 'Magodo'].map((area) => (
                <Link
                  key={area}
                  href={`/search?lga=${encodeURIComponent(area)}`}
                  className="bg-green-50 rounded-lg px-4 py-3 text-center text-green-800 font-medium hover:bg-green-100 transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">List Your Property Today</h2>
            <p className="text-green-100 mb-8 max-w-xl mx-auto">
              Join thousands of landlords and agents on AncerLarins. Reach verified tenants faster.
            </p>
            <Link
              href="/register?role=landlord"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
