'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMobileMenu, closeMobileMenu } from '@/store/slices/uiSlice';
import type { RootState } from '@/store/store';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useDispatch();
  const mobileMenuOpen = useSelector((state: RootState) => state.ui.mobileMenuOpen);

  return (
    <nav className="bg-[#1B2A4A] sticky top-0 z-50 shadow-lg" aria-label="Main navigation">
      <div className="container-app">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">Ancer</span>
            <span className="text-2xl font-bold text-white">Larins</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/properties?listing_type=rent"
              className="text-white/80 hover:text-accent transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Rent
            </Link>
            <Link
              href="/properties?listing_type=sale"
              className="text-white/80 hover:text-accent transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Buy
            </Link>
            <Link
              href="/agents"
              className="text-white/80 hover:text-accent transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Agents
            </Link>
            <Link
              href="/properties"
              className="text-white/80 hover:text-accent transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Search
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-accent transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-white/60 hover:text-white text-sm"
                >
                  Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent text-sm font-semibold">
                    {user?.first_name?.[0]}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-accent text-primary px-5 py-2 rounded-lg hover:bg-accent-dark transition-colors text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="md:hidden text-white p-2"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2" role="menu">
            <div className="flex flex-col gap-1 pt-3">
              <Link
                href="/properties?listing_type=rent"
                onClick={() => dispatch(closeMobileMenu())}
                className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
              >
                Rent
              </Link>
              <Link
                href="/properties?listing_type=sale"
                onClick={() => dispatch(closeMobileMenu())}
                className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
              >
                Buy
              </Link>
              <Link
                href="/agents"
                onClick={() => dispatch(closeMobileMenu())}
                className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
              >
                Agents
              </Link>
              <Link
                href="/properties"
                onClick={() => dispatch(closeMobileMenu())}
                className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
              >
                Search
              </Link>
              <div className="border-t border-white/10 my-2" />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-white/60 text-sm">Dark Mode</span>
                <ThemeToggle />
              </div>
              <div className="border-t border-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); dispatch(closeMobileMenu()); }}
                    className="text-left text-white/60 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="text-white/80 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="bg-accent text-primary px-3 py-2.5 rounded-lg font-semibold text-center mt-1"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
