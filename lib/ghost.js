'use client';

// Fresh "ghost" wallets, generated entirely in the browser with the OS random source.
// Nothing here is sent anywhere or stored. Keys only exist in this tab until it's closed.

const TRUST = 'Trust Wallet or Exodus → Import wallet → Recovery phrase';

export const GHOST_KINDS = {
  solana: { label: 'Solana', icon: 'sol', covers: 'Solana (SOL and SPL tokens)', importIn: 'Phantom, Solflare or Backpack → Add wallet → Import private key' },
  evm: { label: 'EVM', icon: 'eth', covers: 'Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche and BNB Chain (one address works on all)', importIn: 'MetaMask, Rabby or Phantom → Import wallet → Recovery phrase' },
  btc: { label: 'Bitcoin', icon: 'btc', covers: 'Bitcoin (Native SegWit, bc1q…)', importIn: `${TRUST} (or Sparrow / BlueWallet, Native SegWit)` },
  doge: { label: 'Dogecoin', icon: 'doge', covers: 'Dogecoin', importIn: TRUST },
  ltc: { label: 'Litecoin', icon: 'ltc', covers: 'Litecoin (Native SegWit, ltc1q…)', importIn: TRUST },
  xrp: { label: 'XRP', icon: 'xrp', covers: 'XRP Ledger. Holds nothing until it receives at least 1 XRP (the network’s reserve)', importIn: 'Trust Wallet or Xaman → Import → Recovery phrase' },
  tron: { label: 'Tron', icon: 'tron', covers: 'Tron (TRX and USDT on Tron)', importIn: 'TronLink or Trust Wallet → Import wallet → Recovery phrase' },
};

const KIND_FOR_CHAIN = {
  sol: 'solana',
  eth: 'evm', base: 'evm', arb: 'evm', bsc: 'evm', avax: 'evm', op: 'evm', pol: 'evm',
  btc: 'btc', doge: 'doge', ltc: 'ltc', xrp: 'xrp', tron: 'tron',
};

export function ghostKindFor(chainKey) {
  return KIND_FOR_CHAIN[chainKey] || null;
}

export async function createGhostWallet(kind) {
  if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
    throw new Error('This browser can’t generate keys securely.');
  }
  if (kind === 'solana') {
    const [{ Keypair }, bs58mod] = await Promise.all([import('@solana/web3.js'), import('bs58')]);
    const bs58 = bs58mod.default || bs58mod;
    const kp = Keypair.generate();
    return {
      kind,
      address: kp.publicKey.toBase58(),
      secretLabel: 'Private key',
      secret: bs58.encode(kp.secretKey),
    };
  }
  if (!GHOST_KINDS[kind]) throw new Error('Unsupported wallet type');
  const { newPhrase, deriveFromPhrase } = await import('./ghostKeys');
  const phrase = newPhrase();
  const { address, privateKey } = deriveFromPhrase(kind, phrase);
  return {
    kind,
    address,
    secretLabel: 'Recovery phrase',
    secret: phrase,
    extraLabel: 'Private key',
    extra: privateKey,
  };
}

export function ghostBackupText(w) {
  const lines = [
    'Parallax ghost wallet backup',
    `Type: ${GHOST_KINDS[w.kind].covers}`,
    `Address: ${w.address}`,
    `${w.secretLabel}: ${w.secret}`,
  ];
  if (w.extra) lines.push(`${w.extraLabel}: ${w.extra}`);
  lines.push('', 'Anyone with the key or phrase above controls this wallet. Keep it offline and private.');
  lines.push(`Import into: ${GHOST_KINDS[w.kind].importIn}`);
  return lines.join('\n');
}

export function downloadBackup(w) {
  const blob = new Blob([ghostBackupText(w)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parallax-ghost-${w.kind}-${w.address.slice(0, 6)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
