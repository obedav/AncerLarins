'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import type { Neighborhood } from '@/types';

export default function NeighborhoodsPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/neighborhoods')
      .then(({ data }) => setNeighborhoods(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lagos Neighborhoods</h1>
        <p className="text-gray-500 mb-8">Explore popular areas across Lagos and find the perfect location for you.</p>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading neighborhoods...</div>
        ) : neighborhoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neighborhoods.map((neighborhood) => (
              <Link
                key={neighborhood.id}
                href={`/neighborhoods/${neighborhood.slug}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="relative h-48 bg-gray-200">
                  {neighborhood.image_url ? (
                    <img
                      src={neighborhood.image_url}
                      alt={neighborhood.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-600 to-green-800 text-white text-2xl font-bold">
                      {neighborhood.name}
                    </div>
                  )}
                  {neighborhood.safety_rating && (
                    <span className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                      Safety: {neighborhood.safety_rating}/10
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {neighborhood.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{neighborhood.lga}, {neighborhood.state}</p>

                  <div className="flex gap-4 mt-3 text-sm">
                    {neighborhood.formatted_avg_rent && (
                      <div>
                        <span className="text-gray-500">Avg Rent:</span>{' '}
                        <span className="font-medium text-green-700">{neighborhood.formatted_avg_rent}</span>
                      </div>
                    )}
                    {neighborhood.formatted_avg_sale && (
                      <div>
                        <span className="text-gray-500">Avg Sale:</span>{' '}
                        <span className="font-medium text-green-700">{neighborhood.formatted_avg_sale}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {neighborhood.properties_count} {neighborhood.properties_count === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No neighborhoods available yet.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
