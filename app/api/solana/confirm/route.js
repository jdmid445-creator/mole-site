import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Is a Solana transaction confirmed yet, and is its blockhash still able to land? Uses Helius server-side so the key stays private.
export async function GET(request) {
  const sig = new URL(request.url).searchParams.get('sig') || '';
  if (!/^[1-9A-HJ-NP-Za-km-z]{64,100}$/.test(sig)) return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  const key = process.env.HELIUS_API_KEY;
  const rpc = key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';
  const call = (method, params) =>
    fetch(rpc, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), cache: 'no-store' })
      .then((r) => r.json());
  try {
    const [st, bh] = await Promise.all([
      call('getSignatureStatuses', [[sig], { searchTransactionHistory: true }]),
      call('getBlockHeight', [{ commitment: 'confirmed' }]),
    ]);
    const v = st?.result?.value?.[0] || null;
    return NextResponse.json({
      status: v?.confirmationStatus || null, // processed | confirmed | finalized | null (not seen yet)
      failed: Boolean(v?.err),
      blockHeight: bh?.result ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach Solana' }, { status: 502 });
  }
}
