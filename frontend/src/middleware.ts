import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Build connect-src with API URL
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : 'http://localhost:8000';

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.paystack.co https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.tile.openstreetmap.org https://pictures-nigeria.jijistatic.net https://images.propertypro.ng https://www.propertypro.ng https://images.nigeriapropertycentre.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://*.sentry.io https://wa.me https://api.paystack.co`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  const cspHeader = cspDirectives.join('; ');

  // Pass nonce to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Set CSP response header
  response.headers.set('Content-Security-Policy', cspHeader);

  // ── Cache control ─────────────────────────────────────
  const { pathname } = request.nextUrl;

  // Public listing pages — allow CDN/proxy caching
  if (pathname === '/' || pathname === '/properties' || pathname.startsWith('/properties/rent') || pathname.startsWith('/properties/sale')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  }

  // Relatively static pages — longer cache
  if (pathname.startsWith('/about') || pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/pricing')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  // Authenticated pages — never cache
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/agent')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|sw.js|manifest.json).*)',
  ],
};
