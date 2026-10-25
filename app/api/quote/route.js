import { NextResponse } from 'next/server';
import { oneClick, confidentialityLevel, errorMessage } from '@/lib/oneclick';

export const dynamic = 'force-dynamic';

const REQUIRED = ['originAsset', 'destinationAsset', 'amount', 'recipient', 'refundTo'];

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (typeof input?.[field] !== 'string' || !input[field].trim()) {
      return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
    }
  }
  if (!/^\d+$/.test(input.amount)) {
    return NextResponse.json({ error: 'Amount must be in base units' }, { status: 400 });
  }

  const body = {
    dry: Boolean(input.dry),
    swapType: 'EXACT_INPUT',
    slippageTolerance: 100, // 1%
    originAsset: input.originAsset,
    depositType: 'ORIGIN_CHAIN',
    destinationAsset: input.destinationAsset,
    amount: input.amount,
    refundTo: input.refundTo.trim(),
    refundType: 'ORIGIN_CHAIN',
    recipient: input.recipient.trim(),
    recipientType: 'DESTINATION_CHAIN',
    deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    confidentiality: confidentialityLevel(),
  };

  const { ok, status, data } = await oneClick('/v0/quote', { method: 'POST', body: JSON.stringify(body) });
  if (!ok) {
    return NextResponse.json({ error: errorMessage(data, 'Could not get a quote for this route') }, { status });
  }

  const q = data?.quote || {};
  return NextResponse.json({
    dry: body.dry,
    confidentiality: body.confidentiality,
    depositAddress: q.depositAddress || null,
    depositMemo: q.depositMemo || null,
    amountIn: q.amountIn ?? body.amount,
    amountInFormatted: q.amountInFormatted ?? null,
    amountOut: q.amountOut ?? null,
    amountOutFormatted: q.amountOutFormatted ?? null,
    timeEstimate: q.timeEstimate ?? null,
    deadline: q.deadline ?? body.deadline,
  });
}
