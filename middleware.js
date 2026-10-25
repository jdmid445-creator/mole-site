import { NextResponse } from 'next/server';

// Block the swap flow (not the info pages) for comprehensively sanctioned places.
// Uses Vercel's IP location headers. Not legal advice: review this list with counsel and keep it current.
const BLOCKED_COUNTRIES = new Set(['CU', 'IR', 'KP', 'SY']);
// Occupied regions of Ukraine under sanctions: Crimea (43), Sevastopol (40), Donetsk (14), Luhansk (09).
const BLOCKED_UA_REGIONS = new Set(['43', '40', '14', '09']);

export function middleware(request) {
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const region = (request.headers.get('x-vercel-ip-country-region') || '').toUpperCase();
  const blocked = BLOCKED_COUNTRIES.has(country) || (country === 'UA' && BLOCKED_UA_REGIONS.has(region));
  if (!blocked) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Parallax is not available in your region.' }, { status: 451 });
  }
  const url = request.nextUrl.clone();
  url.pathname = '/unavailable';
  return NextResponse.rewrite(url, { status: 451 });
}

export const config = {
  matcher: ['/tunnel', '/api/quote', '/api/submit', '/api/status'],
};
