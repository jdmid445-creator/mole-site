'use client';

// Browser wallet helpers. Keys never leave the user's wallet; the site only asks it to sign.

import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// ---------- Solana (Phantom, Solflare, Backpack) ----------

// The wallet the person picked (or the first one found).
let solSelected = null;
let evmSelected = null;

export const INSTALL = {
  solana: [
    { id: 'phantom', name: 'Phantom', icon: '/wallets/phantom.svg', href: 'https://phantom.com/download' },
    { id: 'solflare', name: 'Solflare', icon: '/wallets/solflare.svg', href: 'https://solflare.com/download' },
    { id: 'backpack', name: 'Backpack', icon: '/wallets/backpack.svg', href: 'https://backpack.app/downloads' },
  ],
  evm: [
    { id: 'metamask', name: 'MetaMask', icon: '/wallets/metamask.svg', href: 'https://metamask.io/download/' },
    { id: 'rabby', name: 'Rabby', icon: '/wallets/rabby.svg', href: 'https://rabby.io/' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '/wallets/coinbase.svg', href: 'https://www.coinbase.com/wallet/downloads' },
  ],
};

// Solana wallets inject themselves into the page under their own names.
export function detectSolanaWallets() {
  if (typeof window === 'undefined') return [];
  const w = window;
  const list = [];
  if (w.phantom?.solana?.isPhantom) list.push({ id: 'phantom', name: 'Phantom', icon: '/wallets/phantom.svg', provider: w.phantom.solana });
  if (w.solflare?.isSolflare) list.push({ id: 'solflare', name: 'Solflare', icon: '/wallets/solflare.svg', provider: w.solflare });
  if (w.backpack && typeof (w.backpack.solana || w.backpack).connect === 'function') {
    list.push({ id: 'backpack', name: 'Backpack', icon: '/wallets/backpack.svg', provider: w.backpack.solana || w.backpack });
  }
  if (!list.length && w.solana && typeof w.solana.connect === 'function') {
    list.push({ id: 'solana', name: w.solana.isPhantom ? 'Phantom' : 'Solana wallet', icon: '/wallets/phantom.svg', provider: w.solana });
  }
  return list;
}

function solanaProvider() {
  if (typeof window === 'undefined') return null;
  return solSelected || detectSolanaWallets()[0]?.provider || null;
}

export function hasSolanaWallet() {
  return Boolean(solanaProvider());
}

// On phones, wallets only inject into their own in-app browser. These links reopen this page inside the wallet app.
export function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function walletAppLinks(kind) {
  if (typeof window === 'undefined') return [];
  const url = window.location.href;
  const ref = window.location.origin;
  const enc = encodeURIComponent;
  if (kind === 'solana') {
    return [
      { name: 'Phantom', href: `https://phantom.app/ul/browse/${enc(url)}?ref=${enc(ref)}` },
      { name: 'Solflare', href: `https://solflare.com/ul/v1/browse/${enc(url)}?ref=${enc(ref)}` },
    ];
  }
  if (kind === 'evm') {
    return [
      { name: 'MetaMask', href: `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, '')}` },
      { name: 'Coinbase Wallet', href: `https://go.cb-w.com/dapp?cb_url=${enc(url)}` },
      { name: 'Phantom', href: `https://phantom.app/ul/browse/${enc(url)}?ref=${enc(ref)}` },
    ];
  }
  return [];
}

export async function connectSolana(id) {
  const found = detectSolanaWallets();
  const pick = found.find((x) => x.id === id) || found[0];
  const provider = pick?.provider;
  if (!provider) throw new Error('No Solana wallet found. Install Phantom, Solflare or Backpack.');
  const res = await provider.connect();
  const key = res?.publicKey || provider.publicKey;
  if (!key) throw new Error('Wallet did not return an address');
  solSelected = provider;
  return key.toString();
}

export async function sendSol({ from, to, lamports }) {
  return sendSolMany({ from, payments: [{ to, lamports }] });
}

// One transaction, one signature, paying several deposit addresses (used by split send).
export async function sendSolMany({ from, payments }) {
  const provider = solanaProvider();
  if (!provider) throw new Error('No Solana wallet found');
  if (!payments?.length) throw new Error('Nothing to send');

  const bh = await fetch('/api/solana/blockhash').then((r) => r.json());
  if (!bh?.blockhash) throw new Error(bh?.error || 'Could not reach Solana');

  const fromKey = new PublicKey(from);
  const tx = new Transaction({
    feePayer: fromKey,
    blockhash: bh.blockhash,
    lastValidBlockHeight: bh.lastValidBlockHeight,
  });
  for (const p of payments) {
    tx.add(SystemProgram.transfer({ fromPubkey: fromKey, toPubkey: new PublicKey(p.to), lamports: BigInt(p.lamports) }));
  }

  if (typeof provider.signAndSendTransaction !== 'function') {
    throw new Error('This wallet cannot send transactions from the site. Use deposit mode instead.');
  }
  const result = await provider.signAndSendTransaction(tx);
  const sig = typeof result === 'string' ? result : result?.signature;
  if (!sig) throw new Error('Your wallet did not return a transaction. Nothing was sent.');
  await confirmSol(sig, bh.lastValidBlockHeight);
  return sig;
}

// Wait until the transaction is confirmed. If its blockhash expires first, it can never land, so it is safe to say
// "nothing was sent" and let the person pay by hand instead.
async function confirmSol(sig, lastValidBlockHeight) {
  const started = Date.now();
  for (;;) {
    let st = null;
    try { st = await fetch(`/api/solana/confirm?sig=${encodeURIComponent(sig)}`, { cache: 'no-store' }).then((r) => r.json()); } catch { /* retry */ }
    if (st?.failed) throw new Error('The Solana transaction failed, so nothing was sent. You can try again or send it yourself below.');
    if (st?.status === 'confirmed' || st?.status === 'finalized') return;
    if (!st?.status && st?.blockHeight && lastValidBlockHeight && st.blockHeight > lastValidBlockHeight) {
      throw new Error('The Solana transaction expired before it landed, so nothing was sent. You can try again or send it yourself below.');
    }
    if (Date.now() - started > 120000) return; // give up waiting; the status checks keep watching the deposit
    await new Promise((r) => setTimeout(r, 1500));
  }
}

// ---------- EVM (MetaMask, Rabby, Coinbase Wallet and other injected wallets) ----------

// EVM wallets announce themselves (EIP-6963), each with its own name and logo, so several can live side by side.
const evmAnnounced = new Map();
if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (e) => {
    const { info, provider } = e.detail || {};
    if (info?.uuid && provider) evmAnnounced.set(info.rdns || info.uuid, { id: info.rdns || info.uuid, name: info.name, icon: info.icon, provider });
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
}

function legacyEvmName(eth) {
  if (eth?.isRabby) return ['Rabby', '/wallets/rabby.svg'];
  if (eth?.isCoinbaseWallet) return ['Coinbase Wallet', '/wallets/coinbase.svg'];
  if (eth?.isPhantom) return ['Phantom', '/wallets/phantom.svg'];
  if (eth?.isMetaMask) return ['MetaMask', '/wallets/metamask.svg'];
  return ['Browser wallet', '/wallets/metamask.svg'];
}

export async function detectEvmWallets() {
  if (typeof window === 'undefined') return [];
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  await new Promise((r) => setTimeout(r, 200));
  const list = [...evmAnnounced.values()];
  if (!list.length && window.ethereum) {
    const [name, icon] = legacyEvmName(window.ethereum);
    list.push({ id: 'injected', name, icon, provider: window.ethereum });
  }
  return list;
}

function evmProvider() {
  if (typeof window === 'undefined') return null;
  return evmSelected || window.ethereum || [...evmAnnounced.values()][0]?.provider || null;
}

export function hasEvmWallet() {
  return Boolean(evmProvider());
}

export async function connectEvm(id) {
  const found = await detectEvmWallets();
  const pick = found.find((x) => x.id === id) || found[0];
  const provider = pick?.provider;
  if (!provider) throw new Error('No browser wallet found. Install MetaMask, Rabby or Coinbase Wallet.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('Wallet did not return an address');
  evmSelected = provider;
  return accounts[0];
}

async function ensureEvmChain(chainId) {
  const provider = evmProvider();
  const current = await provider.request({ method: 'eth_chainId' });
  if (String(current).toLowerCase() === String(chainId).toLowerCase()) return;
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
    const now = await provider.request({ method: 'eth_chainId' });
    if (String(now).toLowerCase() !== String(chainId).toLowerCase()) throw new Error('not switched');
  } catch (e) {
    // 4902 = the wallet doesn't know this network yet. Offer to add it (the person approves in their wallet).
    const params = ADD_CHAIN[String(chainId).toLowerCase()];
    if ((e?.code === 4902 || e?.data?.originalError?.code === 4902) && params) {
      try {
        await provider.request({ method: 'wallet_addEthereumChain', params: [params] });
        const now = await provider.request({ method: 'eth_chainId' });
        if (String(now).toLowerCase() === String(chainId).toLowerCase()) return;
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
        const again = await provider.request({ method: 'eth_chainId' });
        if (String(again).toLowerCase() === String(chainId).toLowerCase()) return;
      } catch {
        /* fall through */
      }
    }
    throw new Error('Switch your wallet to the right network, then try again.');
  }
}

// Public network details for wallets that don't have these chains yet.
const ADD_CHAIN = {
  '0x38': { chainId: '0x38', chainName: 'BNB Chain', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: ['https://bsc-dataseed.bnbchain.org'], blockExplorerUrls: ['https://bscscan.com'] },
  '0xa86a': { chainId: '0xa86a', chainName: 'Avalanche C-Chain', nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 }, rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'], blockExplorerUrls: ['https://snowtrace.io'] },
  '0xa': { chainId: '0xa', chainName: 'OP Mainnet', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.optimism.io'], blockExplorerUrls: ['https://optimistic.etherscan.io'] },
  '0x89': { chainId: '0x89', chainName: 'Polygon', nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }, rpcUrls: ['https://polygon-rpc.com'], blockExplorerUrls: ['https://polygonscan.com'] },
  '0x2105': { chainId: '0x2105', chainName: 'Base', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org'] },
  '0xa4b1': { chainId: '0xa4b1', chainName: 'Arbitrum One', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://arb1.arbitrum.io/rpc'], blockExplorerUrls: ['https://arbiscan.io'] },
};

export async function sendEvmNative({ from, to, wei, chainId }) {
  const provider = evmProvider();
  if (!provider) throw new Error('No browser wallet found');
  await ensureEvmChain(chainId);
  return provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, value: '0x' + BigInt(wei).toString(16), chainId }],
  });
}

// ERC-20 transfer(address,uint256)
export async function sendEvmToken({ from, to, token, amount, chainId }) {
  const provider = evmProvider();
  if (!provider) throw new Error('No browser wallet found');
  await ensureEvmChain(chainId);
  const data =
    '0xa9059cbb' +
    to.toLowerCase().replace(/^0x/, '').padStart(64, '0') +
    BigInt(amount).toString(16).padStart(64, '0');
  return provider.request({ method: 'eth_sendTransaction', params: [{ from, to: token, data, chainId }] });
}
