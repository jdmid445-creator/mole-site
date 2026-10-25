import { NextResponse } from 'next/server';

// TEMPORARY: lets the build assistant pull open-licensed icon files from jsDelivr into the repo. Remove after use.
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const path = new URL(request.url).searchParams.get('p') || '';
  const allowed = /^(npm\/[@a-z0-9._\-/]+|v1\/packages\/npm\/[@a-z0-9._\-/]+(\?structure=flat)?)$/i;
  if (!allowed.test(path) || path.includes('..')) return NextResponse.json({ error: 'bad path' }, { status: 400 });
  const host = path.startsWith('v1/') ? 'https://data.jsdelivr.com/' : 'https://cdn.jsdelivr.net/';
  const res = await fetch(host + path, { cache: 'no-store' });
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'text/plain' } });
}
