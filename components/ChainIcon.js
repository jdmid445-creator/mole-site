// Official network logos (Web3 Icons, MIT). Files live in /public/chains.
const NAMES = { sol: 'Solana', eth: 'Ethereum', base: 'Base', arb: 'Arbitrum', bsc: 'BNB Chain', btc: 'Bitcoin' };

export default function ChainIcon({ chain, size = 24, className = '', label = false }) {
  if (!NAMES[chain]) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/chains/${chain}.svg`}
      width={size}
      height={size}
      alt={label ? NAMES[chain] : ''}
      aria-hidden={label ? undefined : 'true'}
      className={`chain-icon ${className}`}
      decoding="async"
    />
  );
}
