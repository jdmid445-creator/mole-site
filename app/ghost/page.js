import Link from 'next/link';
import GhostWallet from '@/components/GhostWallet';
import GuardMole from '@/components/GuardMole';

export const metadata = {
  title: 'Parallax',
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
        <div className="hero-in ghost-wrap peek-stage peek-ghost" style={{ '--d': '320ms' }}>
          <GuardMole variant="ghost" intro="Your keys. Yours to keep." />
          <GhostWallet />
        </div>
        <div className="ghost-notes hero-in" style={{ '--d': '420ms' }}>
          <h2>Good to know</h2>
          <ul>
            <li>It’s created by your browser’s secure random generator. Parallax never sees or stores the keys.</li>
            <li>A new wallet is only private until you link it. Don’t fund it straight from your main wallet; send to it through a crossing.</li>
            <li>To spend from an EVM ghost wallet you’ll need a little of that chain’s coin for fees (ETH, BNB, POL, AVAX). Tron needs TRX, and XRP keeps 1 XRP locked as a reserve. A crossing can bring that too.</li>
            <li>Every wallet except Solana comes as a standard 12-word recovery phrase, so it imports into Trust Wallet, Exodus, Ledger and most other wallets. Your backup file also has the raw private key.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
