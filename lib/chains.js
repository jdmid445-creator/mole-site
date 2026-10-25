// Chains the Tunnel supports at launch.
// `key` must match the `blockchain` field NEAR Intents uses in its token list.
// `wallet`: 'solana' = one-click with Phantom/Solflare/Backpack,
//           'evm'    = one-click with MetaMask/Rabby/Coinbase Wallet (injected),
//           'deposit'= send from any wallet to the deposit address shown.
export const CHAINS = [
  { key: 'sol', label: 'Solana', native: 'SOL', wallet: 'solana', explorer: 'https://solscan.io/tx/' },
  { key: 'eth', label: 'Ethereum', native: 'ETH', wallet: 'evm', chainId: '0x1', explorer: 'https://etherscan.io/tx/' },
  { key: 'base', label: 'Base', native: 'ETH', wallet: 'evm', chainId: '0x2105', explorer: 'https://basescan.org/tx/' },
  { key: 'arb', label: 'Arbitrum', native: 'ETH', wallet: 'evm', chainId: '0xa4b1', explorer: 'https://arbiscan.io/tx/' },
  { key: 'bsc', label: 'BNB Chain', native: 'BNB', wallet: 'evm', chainId: '0x38', explorer: 'https://bscscan.com/tx/' },
  { key: 'btc', label: 'Bitcoin', native: 'BTC', wallet: 'deposit', explorer: 'https://mempool.space/tx/' },
];

export function getChain(key) {
  return CHAINS.find((c) => c.key === key) || null;
}

const ADDRESS_PATTERNS = {
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  evm: /^0x[a-fA-F0-9]{40}$/,
  btc: /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
};

export function isValidAddress(chainKey, address) {
  const chain = getChain(chainKey);
  if (!chain || !address) return false;
  const a = address.trim();
  if (chain.key === 'sol') return ADDRESS_PATTERNS.solana.test(a);
  if (chain.key === 'btc') return ADDRESS_PATTERNS.btc.test(a);
  return ADDRESS_PATTERNS.evm.test(a);
}

export function addressHint(chainKey) {
  if (chainKey === 'sol') return 'A Solana address';
  if (chainKey === 'btc') return 'A Bitcoin address (bc1…, 1… or 3…)';
  return 'An address starting with 0x';
}
