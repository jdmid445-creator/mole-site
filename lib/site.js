// Public site settings, set in Vercel → Settings → Environment Variables.
export const SITE = {
  tokenContract: process.env.NEXT_PUBLIC_TOKEN_CA || '',
  devWallet: process.env.NEXT_PUBLIC_DEV_WALLET || '',
  xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com/parallaxswap',
  telegramUrl: process.env.NEXT_PUBLIC_TG_URL || '',
};

export function pumpUrl(ca) {
  return ca ? `https://pump.fun/coin/${ca}` : '';
}

export function dexUrl(ca) {
  return ca ? `https://dexscreener.com/solana/${ca}` : '';
}
