import { NextResponse } from 'next/server';
import { oneClick } from '@/lib/oneclick';
import { CHAINS } from '@/lib/chains';

// Live health of the swap network, used by the status badge. Cached briefly at the edge.
export const revalidate = 60;

export async function GET() {
  const started = Date.now();
  const { ok, data } = await oneClick('/v0/tokens');
  const latencyMs = Date.now() - started;

  if (!ok || !Array.isArray(data)) {
    return NextResponse.json({ online: false, checkedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=30' } });
  }

  const supported = new Set(CHAINS.map((c) => c.key));
  const assets = data.filter((t) => t && supported.has(t.blockchain)).length;
  const networkChains = new Set(data.map((t) => t && t.blockchain).filter(Boolean)).size;

  return NextResponse.json(
    { online: true, assets, chains: CHAINS.length, networkChains, latencyMs, checkedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
  );
}
