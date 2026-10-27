export const PARALLAX_CA = '6QBFU9GJ5ZU1c27pRhGudqCXLoFchhsahr1Hi8wwpump';
export const SHOW_CA = true;

// Public site settings, set in Vercel → Settings → Environment Variables.
export const SITE = {
  // Flip SHOW_CA to true to put the CA back everywhere (top bar, $PARALLAX section, chart links).
  tokenContract: SHOW_CA ? PARALLAX_CA : '',
  xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com/parallaxswap',
  telegramUrl: process.env.NEXT_PUBLIC_TG_URL || '',
};

export function pumpUrl(ca) {
  return ca ? `https://pump.fun/coin/${ca}` : '';
}

export function dexUrl(ca) {
  return ca ? `https://dexscreener.com/solana/${ca}` : '';
}
