'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyMap from '@/components/map/PropertyMap';
import api from '@/lib/api';
import type { Neighborhood, Property } from '@/types';

export default function NeighborhoodDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    Promise.all([
      api.get(`/neighborhoods/${slug}`),
      api.get('/properties', { params: { neighborhood: slug } }),
    ])
      .then(([nhRes, propRes]) => {
        setNeighborhood(nhRes.data.data);
        setProperties(propRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
          Loading neighborhood...
        </main>
      </>
    );
  }

  if (!neighborhood) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
          Neighborhood not found.
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          {neighborhood.image_url ? (
            <img
              src={neighborhood.image_url}
              alt={neighborhood.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end p-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{neighborhood.name}</h1>
              <p className="text-white/80 mt-1">{neighborhood.lga}, {neighborhood.state}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {neighborhood.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About {neighborhood.name}</h2>
                <p className="text-gray-600 leading-relaxed">{neighborhood.description}</p>
              </div>
            )}

            {/* Map */}
            {neighborhood.latitude && neighborhood.longitude && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Map</h2>
                <div className="h-[350px] rounded-xl overflow-hidden">
                  <PropertyMap
                    properties={properties}
                    center={[neighborhood.latitude, neighborhood.longitude]}
                    zoom={14}
                  />
                </div>
              </div>
            )}

            {/* Properties */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Properties in {neighborhood.name}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({properties.length} {properties.length === 1 ? 'listing' : 'listings'})
                </span>
              </h2>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No properties listed in this neighborhood yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Area Stats</h3>
              <dl className="space-y-3 text-sm">
                {neighborhood.formatted_avg_rent && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Avg. Rent</dt>
                    <dd className="font-medium text-green-700">{neighborhood.formatted_avg_rent}/yr</dd>
                  </div>
                )}
                {neighborhood.formatted_avg_sale && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Avg. Sale Price</dt>
                    <dd className="font-medium text-green-700">{neighborhood.formatted_avg_sale}</dd>
                  </div>
                )}
                {neighborhood.safety_rating && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Safety Rating</dt>
                    <dd className="font-medium text-gray-900">{neighborhood.safety_rating}/10</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Properties</dt>
                  <dd className="font-medium text-gray-900">{neighborhood.properties_count}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-2">Looking for a place here?</h3>
              <p className="text-sm text-green-700 mb-4">
                Browse all available properties in {neighborhood.name} or contact an agent.
              </p>
              <a
                href={`/search?neighborhood=${neighborhood.slug}`}
                className="block w-full bg-green-700 text-white text-center py-2 rounded-lg hover:bg-green-800 text-sm font-medium"
              >
                Search Properties
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
