'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-green-700">
            AncerLarins
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties?listing_type=rent" className="text-gray-600 hover:text-green-700">
              Rent
            </Link>
            <Link href="/properties?listing_type=sale" className="text-gray-600 hover:text-green-700">
              Buy
            </Link>
            <Link href="/properties?listing_type=shortlet" className="text-gray-600 hover:text-green-700">
              Shortlet
            </Link>
            <Link href="/neighborhoods" className="text-gray-600 hover:text-green-700">
              Neighborhoods
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-green-700">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Logout
                </button>
                <span className="text-sm font-medium text-green-700">
                  {user?.name}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-green-700">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
