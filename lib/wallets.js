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

export async function connectSolana() {
  const provider = solanaProvider();
  if (!provider) throw new Error('No Solana wallet found. Install Phantom, Solflare or Backpack.');
  const res = await provider.connect();
  const key = res?.publicKey || provider.publicKey;
  if (!key) throw new Error('Wallet did not return an address');
  return key.toString();
}

export async function sendSol({ from, to, lamports }) {
  const provider = solanaProvider();
  if (!provider) throw new Error('No Solana wallet found');

  const bh = await fetch('/api/solana/blockhash').then((r) => r.json());
  if (!bh?.blockhash) throw new Error(bh?.error || 'Could not reach Solana');

  const fromKey = new PublicKey(from);
  const tx = new Transaction({
    feePayer: fromKey,
    blockhash: bh.blockhash,
    lastValidBlockHeight: bh.lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({ fromPubkey: fromKey, toPubkey: new PublicKey(to), lamports: BigInt(lamports) })
  );

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
  } catch {
    throw new Error('Switch your wallet to the right network, then try again.');
  }
}

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
