import Link from 'next/link';
import GhostWallet from '@/components/GhostWallet';

export const metadata = {
  title: 'Ghost wallet — Parallax',
  description: 'Create a fresh wallet with no history and no link to your own, right in your browser.',
};

export default function GhostPage() {
  return (
    <section className="section tunnel-section">
      <div className="container">
        <h1 className="page-title hero-in" style={{ '--d': '80ms' }}>Ghost wallet</h1>
        <p className="lede narrow hero-in" style={{ '--d': '200ms' }}>
          A brand-new wallet with no history and no link to yours. Make one, then use it as the far side of a{' '}
          <Link href="/tunnel">crossing</Link>.
        </p>
        <div className="hero-in ghost-wrap" style={{ '--d': '320ms' }}>
          <GhostWallet />
        </div>
        <div className="ghost-notes hero-in" style={{ '--d': '420ms' }}>
          <h2>Good to know</h2>
          <ul>
            <li>It’s created by your browser’s secure random generator. Parallax never sees or stores the keys.</li>
            <li>A new wallet is only private until you link it. Don’t fund it straight from your main wallet; send to it through a crossing.</li>
            <li>To spend from an EVM ghost wallet you’ll need a little ETH or BNB for gas on that chain. A crossing can bring that too.</li>
            <li>Bitcoin ghost wallets are coming later.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
