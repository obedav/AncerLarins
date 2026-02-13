'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProperty, clearCurrent } from '@/store/slices/propertySlice';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyMap from '@/components/map/PropertyMap';
import { formatNaira, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Review } from '@/types';

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current: property, loading } = useSelector((state: RootState) => state.property);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProperty(slug));
    }
    return () => { dispatch(clearCurrent()); };
  }, [slug, dispatch]);

  useEffect(() => {
    if (property) {
      api.get(`/properties/${property.id}/reviews`).then(({ data }) => {
        setReviews(data.data || []);
      }).catch(() => {});
    }
  }, [property]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/properties/${property.id}/reviews`, reviewForm);
      setReviews((prev) => [data.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
    } catch {
      // handled by API interceptor
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !property) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
          {loading ? 'Loading property...' : 'Property not found.'}
        </main>
      </>
    );
  }

  const images = property.images || [];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="relative h-80 lg:h-[450px] bg-gray-200 rounded-xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.image_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                No Images Available
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-36 lg:h-[218px] rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? 'border-green-700' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-700 text-white text-xs px-3 py-1 rounded-full uppercase">
                  {property.listing_type}
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full capitalize">
                  {property.property_type}
                </span>
                {property.is_featured && (
                  <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {property.is_verified && (
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.address}, {property.lga}, {property.state}</p>
              <p className="text-3xl font-bold text-green-700 mt-3">
                {property.formatted_price}
                {property.listing_type === 'rent' && <span className="text-base font-normal text-gray-500">/year</span>}
                {property.listing_type === 'shortlet' && <span className="text-base font-normal text-gray-500">/night</span>}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                <p className="text-sm text-gray-500">Bedrooms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                <p className="text-sm text-gray-500">Bathrooms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{property.toilets}</p>
                <p className="text-sm text-gray-500">Toilets</p>
              </div>
              {property.area_sqm && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{property.area_sqm}</p>
                  <p className="text-sm text-gray-500">sqm</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {property.amenities.is_furnished && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Furnished</span>
                )}
                {property.amenities.has_parking && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Parking</span>
                )}
                {property.amenities.has_security && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">24/7 Security</span>
                )}
                {property.amenities.has_pool && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Swimming Pool</span>
                )}
                {property.amenities.has_gym && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Gym</span>
                )}
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
                <div className="h-[350px] rounded-xl overflow-hidden">
                  <PropertyMap
                    properties={[property]}
                    center={[property.latitude, property.longitude]}
                    zoom={15}
                  />
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews
                {reviews.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </h2>

              <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <label className="text-sm font-medium text-gray-700">Rating:</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Write your review..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 bg-green-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{review.user.name}</span>
                          <span className="text-yellow-500 text-sm">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this property.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            {property.owner && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Listed by</h3>
                <div className="flex items-center gap-3 mb-4">
                  {property.owner.avatar_url ? (
                    <img
                      src={property.owner.avatar_url}
                      alt={property.owner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {property.owner.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{property.owner.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{property.owner.role}</p>
                  </div>
                </div>
                {property.owner.phone && (
                  <a
                    href={`tel:${property.owner.phone}`}
                    className="block w-full bg-green-700 text-white text-center py-2 rounded-lg hover:bg-green-800 text-sm font-medium mb-2"
                  >
                    Call {property.owner.phone}
                  </a>
                )}
                <a
                  href={`https://wa.me/${property.owner.phone}?text=Hi, I'm interested in "${property.title}" on AncerLarins`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  WhatsApp
                </a>
              </div>
            )}

            {/* Neighborhood */}
            {property.neighborhood && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Neighborhood</h3>
                <a href={`/neighborhoods/${property.neighborhood.slug}`} className="text-green-700 font-medium hover:underline">
                  {property.neighborhood.name}
                </a>
                {property.neighborhood.safety_rating && (
                  <p className="text-sm text-gray-500 mt-1">
                    Safety: {property.neighborhood.safety_rating}/10
                  </p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="capitalize text-gray-900">{property.property_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="capitalize text-gray-900">{property.status}</dd>
                </div>
                {property.year_built && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Year Built</dt>
                    <dd className="text-gray-900">{property.year_built}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Listed</dt>
                  <dd className="text-gray-900">{formatDate(property.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
