'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMobileMenu, closeMobileMenu } from '@/store/slices/uiSlice';
import type { RootState } from '@/store/store';
import ThemeToggle from '@/components/ui/ThemeToggle';

/* ------------------------------------------------------------------ */
/*  Dropdown data                                                      */
/* ------------------------------------------------------------------ */

interface DropdownLink {
  label: string;
  href: string;
  desc?: string;
}

interface DropdownSection {
  title: string;
  links: DropdownLink[];
}

interface NavItem {
  label: string;
  href: string;
  sections?: DropdownSection[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Buy',
    href: '/properties?listing_type=sale',
    sections: [
      {
        title: 'Homes for Sale',
        links: [
          { label: 'All For Sale', href: '/properties?listing_type=sale' },
          { label: 'Houses & Duplexes', href: '/properties?listing_type=sale&q=duplex' },
          { label: 'Apartments & Flats', href: '/properties?listing_type=sale&q=apartment' },
          { label: 'Penthouses', href: '/properties?listing_type=sale&q=penthouse' },
          { label: 'Land & Plots', href: '/properties?listing_type=sale&q=land' },
          { label: 'Commercial', href: '/properties?listing_type=sale&q=commercial' },
        ],
      },
      {
        title: 'Buying Resources',
        links: [
          { label: 'AncerEstimate', href: '/properties?listing_type=sale', desc: 'Automated property valuations' },
          { label: 'Mortgage Calculator', href: '/properties?listing_type=sale', desc: 'Estimate monthly payments' },
          { label: 'Market Trends', href: '/neighborhoods', desc: 'Area price insights & trends' },
          { label: 'New Listings', href: '/properties?listing_type=sale&sort_by=newest', desc: 'Latest properties for sale' },
        ],
      },
    ],
  },
  {
    label: 'Rent',
    href: '/properties?listing_type=rent',
    sections: [
      {
        title: 'Homes for Rent',
        links: [
          { label: 'All Rentals', href: '/properties?listing_type=rent' },
          { label: 'Apartments', href: '/properties?listing_type=rent&q=apartment' },
          { label: 'Houses & Duplexes', href: '/properties?listing_type=rent&q=duplex' },
          { label: 'Self Contain', href: '/properties?listing_type=rent&q=self+contain' },
          { label: 'Furnished Rentals', href: '/properties?listing_type=rent&furnishing=furnished' },
        ],
      },
      {
        title: 'Renting Resources',
        links: [
          { label: 'Neighborhood Reviews', href: '/neighborhoods', desc: 'Safety, transport & amenity scores' },
          { label: 'New Listings', href: '/properties?listing_type=rent&sort_by=newest', desc: 'Latest properties for rent' },
          { label: 'Affordable Rentals', href: '/properties?listing_type=rent&sort_by=price_asc', desc: 'Lowest price first' },
        ],
      },
    ],
  },
  {
    label: 'Short Let',
    href: '/properties?listing_type=short_let',
    sections: [
      {
        title: 'Short Let Rentals',
        links: [
          { label: 'All Short Lets', href: '/properties?listing_type=short_let' },
          { label: 'Furnished Apartments', href: '/properties?listing_type=short_let&furnishing=furnished' },
          { label: 'Serviced Apartments', href: '/properties?listing_type=short_let&is_serviced=true' },
          { label: 'Houses & Duplexes', href: '/properties?listing_type=short_let&q=duplex' },
          { label: 'Budget-Friendly', href: '/properties?listing_type=short_let&sort_by=price_asc', desc: 'Lowest price first' },
        ],
      },
      {
        title: 'Short Let Resources',
        links: [
          { label: 'New Listings', href: '/properties?listing_type=short_let&sort_by=newest', desc: 'Latest short let properties' },
          { label: 'List a Short Let', href: '/dashboard/listings/new', desc: 'Earn from your property' },
          { label: 'Neighborhood Reviews', href: '/neighborhoods', desc: 'Safety & amenity scores' },
        ],
      },
    ],
  },
  {
    label: 'Sell',
    href: '/register?role=agent',
    sections: [
      {
        title: 'List a Property',
        links: [
          { label: 'List Your Property', href: '/dashboard/listings/new', desc: 'Reach thousands of buyers' },
          { label: 'Agent Dashboard', href: '/dashboard', desc: 'Manage listings & leads' },
          { label: 'Agent Sign Up', href: '/register?role=agent', desc: 'Create your agent profile' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Market Trends', href: '/neighborhoods', desc: 'Price data by area' },
          { label: 'Mortgage Calculator', href: '/properties?listing_type=sale', desc: 'Estimate monthly payments' },
        ],
      },
    ],
  },
  {
    label: 'Agents',
    href: '/agents',
    sections: [
      {
        title: 'Find Agents',
        links: [
          { label: 'All Agents', href: '/agents', desc: 'Browse verified agents' },
          { label: 'Verified Agents', href: '/agents', desc: 'Trusted & verified professionals' },
        ],
      },
      {
        title: 'Become an Agent',
        links: [
          { label: 'Agent Sign Up', href: '/register?role=agent', desc: 'Create your agent profile' },
          { label: 'Agent Dashboard', href: '/dashboard', desc: 'Manage your listings' },
        ],
      },
    ],
  },
  {
    label: 'Neighborhoods',
    href: '/neighborhoods',
    sections: [
      {
        title: 'Popular Areas',
        links: [
          { label: 'Lekki', href: '/properties?area=lekki' },
          { label: 'Ikoyi', href: '/properties?area=ikoyi' },
          { label: 'Victoria Island', href: '/properties?area=victoria-island' },
          { label: 'Yaba', href: '/properties?area=yaba' },
          { label: 'Ikeja', href: '/properties?area=ikeja' },
          { label: 'Ajah', href: '/properties?area=ajah' },
        ],
      },
      {
        title: 'Discover',
        links: [
          { label: 'All Neighborhoods', href: '/neighborhoods', desc: 'Explore every Lagos area' },
          { label: 'Neighborhood Reviews', href: '/neighborhoods', desc: 'Resident ratings & insights' },
          { label: 'Area Market Trends', href: '/neighborhoods', desc: 'Price data & comparisons' },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Desktop dropdown component                                         */
/* ------------------------------------------------------------------ */

function NavDropdown({
  item,
  isOpen,
  onOpen,
  onClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    onOpen();
  }, [onOpen]);

  const handleLeave = useCallback(() => {
    timeout.current = setTimeout(onClose, 150);
  }, [onClose]);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={item.href}
        className={`flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors ${
          isOpen ? 'text-accent' : 'text-white/80 hover:text-accent'
        }`}
      >
        {item.label}
      </Link>

      {/* Dropdown panel */}
      {item.sections && (
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}
        >
          <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden min-w-[420px]">
            {/* Top accent line */}
            <div className="h-0.5 bg-accent" />

            <div className="grid grid-cols-2 gap-0 divide-x divide-border">
              {item.sections.map((section) => (
                <div key={section.title} className="p-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={onClose}
                        className="block px-3 py-2 rounded-lg hover:bg-accent-dark/5 transition-colors group"
                      >
                        <span className="text-sm font-medium text-text-primary group-hover:text-accent-dark transition-colors">
                          {link.label}
                        </span>
                        {link.desc && (
                          <span className="block text-xs text-text-muted mt-0.5">{link.desc}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile accordion item                                              */
/* ------------------------------------------------------------------ */

function MobileNavItem({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!item.sections) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
      >
        {item.label}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="ml-3 pl-3 border-l border-white/10 mt-1 mb-2 space-y-1">
          {item.sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 py-1.5">
                {section.title}
              </p>
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onNavigate}
                  className="block text-white/60 hover:text-accent text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                  {link.desc && (
                    <span className="block text-xs text-white/30 mt-0.5">{link.desc}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Navbar                                                        */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useDispatch();
  const mobileMenuOpen = useSelector((state: RootState) => state.ui.mobileMenuOpen);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleNavigate = useCallback(() => {
    dispatch(closeMobileMenu());
    setOpenDropdown(null);
  }, [dispatch]);

  return (
    <nav className="bg-[#0F1D35] sticky top-0 z-50 shadow-lg" aria-label="Main navigation">
      <div className="container-app">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpenDropdown(null)}>
            <Image src="/images/logo-white.png" alt="AncerLarins" width={36} height={36} className="h-9 w-auto" />
            <span className="text-2xl font-bold text-accent">Ancer</span>
            <span className="text-2xl font-bold text-white">Larins</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <NavDropdown
                key={item.label}
                item={item}
                isOpen={openDropdown === item.label}
                onOpen={() => setOpenDropdown(item.label)}
                onClose={() => setOpenDropdown(null)}
              />
            ))}
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
              {NAV_ITEMS.map((item) => (
                <MobileNavItem key={item.label} item={item} onNavigate={handleNavigate} />
              ))}

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
                    onClick={handleNavigate}
                    className="text-white/80 hover:text-accent px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); handleNavigate(); }}
                    className="text-left text-white/60 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={handleNavigate}
                    className="text-white/80 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={handleNavigate}
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

      {/* Overlay to close dropdowns when clicking outside */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-[-1] hidden md:block"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </nav>
  );
}
