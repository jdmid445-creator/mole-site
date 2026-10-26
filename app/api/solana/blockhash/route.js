import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fetches a recent Solana blockhash through Helius so the API key never reaches the browser.
export async function GET() {
  const key = process.env.HELIUS_API_KEY;
  const rpc = key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : 'https://api.mainnet-beta.solana.com';

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [{ commitment: 'confirmed' }] }),
      cache: 'no-store',
    });
    const json = await res.json();
    const value = json?.result?.value;
    if (!value?.blockhash) throw new Error('No blockhash');
    return NextResponse.json({ blockhash: value.blockhash, lastValidBlockHeight: value.lastValidBlockHeight });
  } catch {
    return NextResponse.json({ error: 'Could not reach Solana. Try again in a moment.' }, { status: 502 });
  }
}
