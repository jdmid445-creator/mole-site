import CopyButton from './CopyButton';
import { SITE, pumpUrl, dexUrl } from '@/lib/site';

// Slim bar at the very top of every page: the $PARALLAX contract address, one tap to copy.
// Set the address in lib/site.js (or NEXT_PUBLIC_TOKEN_CA in Vercel). Until then it shows a "posted at launch" note.
export default function CaBar() {
  const ca = SITE.tokenContract;
  const short = ca ? `${ca.slice(0, 6)}…${ca.slice(-6)}` : '';
  return (
    <div className="ca-bar" role="region" aria-label="$PARALLAX contract address">
      <div className="ca-bar-row">
        <span className="ca-bar-label">$PARALLAX CA</span>
        {ca ? (
          <>
            <code className="ca-bar-addr" title={ca}>
              <span className="ca-full">{ca}</span>
              <span className="ca-short">{short}</span>
            </code>
            <CopyButton value={ca} />
            <span className="ca-bar-links">
              <a href={pumpUrl(ca)} target="_blank" rel="noopener noreferrer">pump.fun</a>
              <a href={dexUrl(ca)} target="_blank" rel="noopener noreferrer">DexScreener</a>
            </span>
          </>
        ) : (
          <span className="ca-bar-soon">Posted here at launch.<span className="ca-soon-more"> Ignore any address you see before then.</span></span>
        )}
      </div>
    </div>
  );
}
