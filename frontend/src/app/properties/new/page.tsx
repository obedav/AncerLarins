'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';

const PROPERTY_TYPES = [
  'apartment', 'house', 'duplex', 'bungalow', 'terrace',
  'penthouse', 'studio', 'commercial', 'land', 'shortlet',
];

const LISTING_TYPES = ['rent', 'sale', 'shortlet'];

export default function NewPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    listing_type: 'rent',
    property_type: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    toilets: '1',
    area_sqm: '',
    address: '',
    city: 'Lagos',
    state: 'Lagos',
    lga: '',
    latitude: '',
    longitude: '',
    year_built: '',
    is_furnished: false,
    has_parking: false,
    has_security: false,
    has_pool: false,
    has_gym: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        toilets: Number(form.toilets),
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        year_built: form.year_built ? Number(form.year_built) : null,
      };

      const { data } = await api.post('/properties', payload);
      const propertyId = data.data.id;

      // Upload images if any
      if (images.length > 0 && propertyId) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images[]', img));
        await api.post(`/properties/${propertyId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push(`/properties/${data.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">List a New Property</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Spacious 3 Bedroom Apartment in Lekki"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select
                  value={form.listing_type}
                  onChange={(e) => updateField('listing_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {LISTING_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={form.property_type}
                  onChange={(e) => updateField('property_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="e.g. 3500000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Property Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => updateField('bedrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => updateField('bathrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toilets</label>
                <input
                  type="number"
                  min="0"
                  value={form.toilets}
                  onChange={(e) => updateField('toilets', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqm)</label>
                <input
                  type="number"
                  min="0"
                  value={form.area_sqm}
                  onChange={(e) => updateField('area_sqm', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  min="1900"
                  max="2026"
                  value={form.year_built}
                  onChange={(e) => updateField('year_built', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Location</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="e.g. 15 Admiralty Way"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                <input
                  type="text"
                  required
                  value={form.lga}
                  onChange={(e) => updateField('lga', e.target.value)}
                  placeholder="e.g. Eti-Osa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                  placeholder="e.g. 6.4412"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                  placeholder="e.g. 3.4718"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'is_furnished', label: 'Furnished' },
                { key: 'has_parking', label: 'Parking Space' },
                { key: 'has_security', label: '24/7 Security' },
                { key: 'has_pool', label: 'Swimming Pool' },
                { key: 'has_gym', label: 'Gym' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => updateField(key, e.target.checked)}
                    className="w-4 h-4 text-green-700 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Photos</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="text-sm text-gray-600"
            />
            {images.length > 0 && (
              <p className="text-sm text-gray-500">{images.length} image{images.length !== 1 ? 's' : ''} selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 font-medium text-lg"
          >
            {submitting ? 'Publishing...' : 'Publish Property'}
          </button>
        </form>
      </main>
    </>
  );
}
