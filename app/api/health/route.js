import { NextResponse } from 'next/server';
import { confidentialityLevel } from '@/lib/oneclick';

export const dynamic = 'force-dynamic';

// Shows which settings are present (never their values) so setup can be checked on a preview deploy.
export async function GET() {
  return NextResponse.json({
    heliusKey: Boolean(process.env.HELIUS_API_KEY),
    nearIntentsKey: Boolean(process.env.NEAR_INTENTS_JWT),
    confidentiality: confidentialityLevel(),
    tokenContract: Boolean(process.env.NEXT_PUBLIC_TOKEN_CA),
  });
}
