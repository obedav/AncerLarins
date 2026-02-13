'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import PropertyCard from '@/components/property/PropertyCard';
import api from '@/lib/api';
import { formatNaira, formatDate } from '@/lib/utils';
import type { Property, Booking, Payment } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchMe } = useAuth();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings' | 'payments' | 'favorites'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMe();
  }, [isAuthenticated, router, fetchMe]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    Promise.all([
      api.get('/my/properties').catch(() => ({ data: { data: [] } })),
      api.get('/bookings').catch(() => ({ data: { data: [] } })),
      api.get('/payments/history').catch(() => ({ data: { data: [] } })),
      api.get('/favorites').catch(() => ({ data: { data: [] } })),
    ])
      .then(([propRes, bookRes, payRes, favRes]) => {
        setMyProperties(propRes.data.data || []);
        setBookings(bookRes.data.data || []);
        setPayments(payRes.data.data || []);
        setFavorites(favRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'properties' as const, label: `My Properties (${myProperties.length})` },
    { id: 'bookings' as const, label: `Bookings (${bookings.length})` },
    { id: 'payments' as const, label: `Payments (${payments.length})` },
    { id: 'favorites' as const, label: `Favorites (${favorites.length})` },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500 capitalize">{user.role} &middot; {user.email}</p>
            {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
          </div>
          <Link
            href="/profile/edit"
            className="ml-auto text-sm text-green-700 hover:underline"
          >
            Edit Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">{myProperties.length}</p>
                    <p className="text-sm text-gray-500">Properties</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                    <p className="text-sm text-gray-500">Bookings</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{payments.length}</p>
                    <p className="text-sm text-gray-500">Payments</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-500">{favorites.length}</p>
                    <p className="text-sm text-gray-500">Favorites</p>
                  </div>
                </div>

                {(user.role === 'landlord' || user.role === 'agent') && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-2">List a Property</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Reach thousands of tenants and buyers across Lagos.
                    </p>
                    <Link
                      href="/properties/new"
                      className="inline-block bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 text-sm font-medium"
                    >
                      Add New Property
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                {myProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>You haven&apos;t listed any properties yet.</p>
                    {(user.role === 'landlord' || user.role === 'agent') && (
                      <Link href="/properties/new" className="text-green-700 font-medium hover:underline mt-2 inline-block">
                        List your first property
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{booking.property?.title || 'Property'}</p>
                          <p className="text-sm text-gray-500">
                            Scheduled: {formatDate(booking.scheduled_at)}
                          </p>
                          {booking.notes && <p className="text-sm text-gray-400 mt-1">{booking.notes}</p>}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">No bookings yet.</div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                {payments.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{payment.reference}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{payment.formatted_amount}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                payment.status === 'success' ? 'bg-green-100 text-green-700' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{formatDate(payment.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">No payment history.</div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>No favorite properties yet.</p>
                    <Link href="/search" className="text-green-700 font-medium hover:underline mt-2 inline-block">
                      Browse properties
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
