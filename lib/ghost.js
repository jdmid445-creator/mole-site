'use client';

// Fresh "ghost" wallets, generated entirely in the browser with the OS random source.
// Nothing here is sent anywhere or stored. Keys only exist in this tab until it's closed.

export const GHOST_KINDS = {
  solana: { label: 'Solana', covers: 'Solana (SOL and SPL tokens)', importIn: 'Phantom, Solflare or Backpack → Add wallet → Import private key' },
  evm: { label: 'EVM', covers: 'Ethereum, Base, Arbitrum and BNB Chain (one address works on all)', importIn: 'MetaMask, Rabby or Phantom → Import wallet → Recovery phrase' },
};

export function ghostKindFor(chainKey) {
  if (chainKey === 'sol') return 'solana';
  if (['eth', 'base', 'arb', 'bsc'].includes(chainKey)) return 'evm';
  return null;
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
  if (kind === 'evm') {
    const { Wallet } = await import('ethers');
    const w = Wallet.createRandom();
    return {
      kind,
      address: w.address,
      secretLabel: 'Recovery phrase',
      secret: w.mnemonic.phrase,
      extraLabel: 'Private key',
      extra: w.privateKey,
    };
  }
  throw new Error('Unsupported wallet type');
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
