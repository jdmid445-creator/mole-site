// Chains Parallax supports at launch.
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
  { key: 'avax', label: 'Avalanche', native: 'AVAX', wallet: 'evm', chainId: '0xa86a', explorer: 'https://snowtrace.io/tx/' },
  { key: 'op', label: 'Optimism', native: 'ETH', wallet: 'evm', chainId: '0xa', explorer: 'https://optimistic.etherscan.io/tx/' },
  { key: 'pol', label: 'Polygon', native: 'POL', wallet: 'evm', chainId: '0x89', explorer: 'https://polygonscan.com/tx/' },
  { key: 'btc', label: 'Bitcoin', native: 'BTC', wallet: 'deposit', explorer: 'https://mempool.space/tx/' },
  { key: 'doge', label: 'Dogecoin', native: 'DOGE', wallet: 'deposit', explorer: 'https://blockchair.com/dogecoin/transaction/' },
  { key: 'ltc', label: 'Litecoin', native: 'LTC', wallet: 'deposit', explorer: 'https://blockchair.com/litecoin/transaction/' },
  { key: 'xrp', label: 'XRP Ledger', native: 'XRP', wallet: 'deposit', explorer: 'https://xrpscan.com/tx/' },
  { key: 'tron', label: 'Tron', native: 'TRX', wallet: 'deposit', explorer: 'https://tronscan.org/#/transaction/' },
];

export function getChain(key) {
  return CHAINS.find((c) => c.key === key) || null;
}

const B58 = '[1-9A-HJ-NP-Za-km-z]';
const ADDRESS_PATTERNS = {
  sol: new RegExp(`^${B58}{32,44}$`),
  evm: /^0x[a-fA-F0-9]{40}$/,
  btc: /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  doge: new RegExp(`^[DA9]${B58}{25,34}$`),
  ltc: /^(ltc1[a-z0-9]{25,87}|[LM3][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  xrp: new RegExp(`^r${B58}{24,34}$`),
  tron: new RegExp(`^T${B58}{33}$`),
};

const HINTS = {
  sol: 'A Solana address',
  btc: 'A Bitcoin address (bc1…, 1… or 3…)',
  doge: 'A Dogecoin address (D…)',
  ltc: 'A Litecoin address (ltc1…, L… or M…)',
  xrp: 'An XRP address (r…)',
  tron: 'A Tron address (T…)',
};

export function isValidAddress(chainKey, address) {
  const chain = getChain(chainKey);
  if (!chain || !address) return false;
  const re = ADDRESS_PATTERNS[chain.key] || (chain.wallet === 'evm' ? ADDRESS_PATTERNS.evm : null);
  return Boolean(re && re.test(address.trim()));
}

export function addressHint(chainKey) {
  return HINTS[chainKey] || 'An address starting with 0x';
}
