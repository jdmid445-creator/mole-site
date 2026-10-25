'use client';

// Browser wallet helpers. Keys never leave the user's wallet; the site only asks it to sign.

import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// ---------- Solana (Phantom, Solflare, Backpack) ----------

function solanaProvider() {
  if (typeof window === 'undefined') return null;
  return window.phantom?.solana || window.solflare || window.backpack || window.solana || null;
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

export async function connectSolana() {
  const provider = solanaProvider();
  if (!provider) throw new Error('No Solana wallet found. Install Phantom, Solflare or Backpack.');
  const res = await provider.connect();
  const key = res?.publicKey || provider.publicKey;
  if (!key) throw new Error('Wallet did not return an address');
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

  if (typeof provider.signAndSendTransaction === 'function') {
    const result = await provider.signAndSendTransaction(tx);
    return typeof result === 'string' ? result : result?.signature;
  }
  throw new Error('This wallet cannot send transactions from the site. Use deposit mode instead.');
}

// ---------- EVM (MetaMask, Rabby, Coinbase Wallet and other injected wallets) ----------

function evmProvider() {
  if (typeof window === 'undefined') return null;
  return window.ethereum || null;
}

export function hasEvmWallet() {
  return Boolean(evmProvider());
}

export async function connectEvm() {
  const provider = evmProvider();
  if (!provider) throw new Error('No browser wallet found. Install MetaMask, Rabby or Coinbase Wallet.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('Wallet did not return an address');
  return accounts[0];
}

async function ensureEvmChain(chainId) {
  const provider = evmProvider();
  const current = await provider.request({ method: 'eth_chainId' });
  if (String(current).toLowerCase() === String(chainId).toLowerCase()) return;
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
  } catch (e) {
    // 4902 = the wallet doesn't know this network yet. Offer to add it (the person approves in their wallet).
    const params = ADD_CHAIN[String(chainId).toLowerCase()];
    if ((e?.code === 4902 || e?.data?.originalError?.code === 4902) && params) {
      try {
        await provider.request({ method: 'wallet_addEthereumChain', params: [params] });
        return;
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
    params: [{ from, to, value: '0x' + BigInt(wei).toString(16) }],
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
  return provider.request({ method: 'eth_sendTransaction', params: [{ from, to: token, data }] });
}
