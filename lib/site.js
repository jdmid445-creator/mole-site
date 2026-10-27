// Public site settings, set in Vercel → Settings → Environment Variables.
export const SITE = {
  tokenContract: '6QBFU9GJ5ZU1c27pRhGudqCXLoFchhsahr1Hi8wwpump', // $PARALLAX on pump.fun (Solana), live 2026-10-27
  xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com/parallaxswap',
  telegramUrl: process.env.NEXT_PUBLIC_TG_URL || '',
};

export function pumpUrl(ca) {
  return ca ? `https://pump.fun/coin/${ca}` : '';
}

export function dexUrl(ca) {
  return ca ? `https://dexscreener.com/solana/${ca}` : '';
}
