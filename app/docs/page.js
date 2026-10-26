import Link from 'next/link';
import GuardMole from '@/components/GuardMole';

export const metadata = {
  title: 'Docs — Parallax',
  description: 'How Parallax works: crossings, privacy model, fees, supported chains, security and limits.',
};

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'crossing', title: 'How a crossing works' },
  { id: 'privacy', title: 'What’s hidden, what isn’t' },
  { id: 'fees', title: 'Fees' },
  { id: 'chains', title: 'Chains and wallets' },
  { id: 'split', title: 'Split send' },
  { id: 'phone', title: 'On a phone' },
  { id: 'mine', title: 'My Crossings' },
  { id: 'security', title: 'Security model' },
  { id: 'habits', title: 'Good habits' },
  { id: 'limits', title: 'Limits and risks' },
  { id: 'compliance', title: 'Compliance' },
  { id: 'token', title: '$PARALLAX' },
];

export default function Docs() {
  return (
    <section className="section">
      <div className="container docs">
        <nav className="docs-nav" aria-label="Docs sections">
          <p className="docs-nav-title">Docs</p>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
            ))}
          </ul>
        </nav>

        <article className="docs-body prose">
          <GuardMole variant="docs" intro="Let me show you around." />
          <h1 className="page-title hero-in">Parallax docs</h1>
          <p className="lede hero-in" style={{ '--d': '120ms' }}>
            Everything Parallax does, what it doesn’t, and how to get the most privacy out of it.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Parallax is a website for moving crypto from one chain to another, for example SOL on Solana into ETH on Base,
            without a public link between the wallet you send from and the wallet you receive in. It’s an interface on top of
            NEAR Intents, a cross-chain swap network, with its confidential mode switched on.
          </p>
          <p>Parallax never holds your funds or your keys, has no accounts, and charges no app fee.</p>

          <h2 id="crossing">How a crossing works</h2>
          <ol>
            <li><strong>Pick both ends.</strong> Choose what you send and what you want. Paste your wallet address (sending from) and your private wallet address (receiving into). Tapping Phantom, Solflare or Backpack fills in the first one for you.</li>
            <li><strong>Get a quote.</strong> Parallax asks the network for a quote and a one-time deposit address for this crossing.</li>
            <li><strong>Send once.</strong> If you tapped your wallet, it pops up and you approve one transfer. Otherwise you send the exact amount to the deposit address yourself (there’s a QR code), from any wallet, exchange or Axiom. Parallax never touches the funds.</li>
            <li><strong>The network swaps it.</strong> NEAR Intents executes the swap in confidential mode.</li>
            <li><strong>It arrives.</strong> Your private wallet receives the funds from a network address. If anything fails, the network refunds the wallet you sent from.</li>
          </ol>
          <p>Follow your crossings on <Link href="/track">My Crossings</Link>.</p>

          <h2 id="privacy">What’s hidden, what isn’t</h2>
          <p><strong>Hidden:</strong> the public link between your sending and receiving wallets, and the amount, timing and routing inside the network.</p>
          <p>
            <strong>Still public:</strong> your deposit (your wallet sending to a deposit address) and the arrival (a network
            address sending to your destination wallet). Each is visible on its own chain. They just aren’t publicly
            connected to each other.
          </p>
          <p>No tool makes anyone anonymous, and we don’t claim this one does.</p>

          <h2 id="fees">Fees</h2>
          <p>
            Parallax charges no app fee. Each quote already includes the network’s swap cost and gas, so the amount you see
            is the amount you should expect. Prices can move up to 1% before the swap completes.
          </p>

          <h2 id="chains">Chains and wallets</h2>
          <ul>
            <li><strong>Solana:</strong> Phantom, Solflare, Backpack (tap to connect), or send from Axiom or any wallet.</li>
            <li><strong>Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, BNB Chain:</strong> MetaMask, Rabby, Coinbase Wallet and other browser wallets (tap to connect), or send from any wallet.</li>
            <li><strong>Bitcoin, Dogecoin, Litecoin, XRP, Tron:</strong> send from any wallet to the deposit address shown (include the memo/tag if one is shown). XRP destinations need at least 1 XRP to activate a new address.</li>
          </ul>
          <p>On any chain you can skip connecting: paste your wallet address and send to the deposit address yourself.</p>

          <h2 id="split">Split send</h2>
          <p>
            On the swap page, choose <strong>Split across wallets</strong> to send one amount to 2–5 destination wallets. Each part
            gets its own private crossing and deposit address, so the parts arrive separately from different network addresses.
            From a Solana wallet it is still one signature: a single transaction pays every deposit address. EVM wallets ask you to
            approve each part. Uneven shares are harder to match than equal ones; <strong>Shuffle amounts</strong> mixes them up.
          </p>

          <h2 id="phone">On a phone</h2>
          <p>
            On a phone, wallets only connect inside their own app. If none is found, the swap page offers <strong>Open in Phantom</strong>
            (or Solflare, MetaMask, Coinbase Wallet), which reopens Parallax there. Or paste your address and send it yourself.
          </p>

          <h2 id="mine">My Crossings</h2>
          <p>
            Crossings you start are listed on <Link href="/track">My Crossings</Link> with their live status, saved only in your
            browser (never your receiving wallet). You can also paste any deposit address there to check it.
          </p>

          <h2 id="security">Security model</h2>
          <ul>
            <li><strong>Non-custodial.</strong> Your wallet signs one transfer to the network’s deposit address. Parallax has no ability to move funds.</li>
            <li><strong>No secrets stored.</strong> No accounts, no private keys, no saved swap history on our side. Your last chain pair and recent crossings are remembered only in your browser.</li>
            <li><strong>Private service keys.</strong> Our service keys stay on our server and never reach your browser.</li>
            <li><strong>Refunds.</strong> If a swap can’t complete, the network returns funds to the wallet you sent from.</li>
          </ul>

          <h2 id="habits">Good habits</h2>
          <ul>
            <li>Send to a fresh wallet that has never touched your main one.</li>
            <li>Use round amounts. Unusual amounts are easy to match.</li>
            <li>Don’t move everything at once, and let some time pass between crossings.</li>
            <li>Never send directly between your two wallets outside Parallax. That links them publicly forever.</li>
          </ul>

          <h2 id="limits">Limits and risks</h2>
          <ul>
            <li>The swap network is run by third parties and can pause, fail or change.</li>
            <li>Prices move; you may receive up to 1% less than the quote.</li>
            <li>Sending a different amount or asset than shown, or to the wrong address, can lose funds.</li>
            <li>Small or unusual amounts and quick round trips make matching easier.</li>
          </ul>

          <h2 id="compliance">Compliance</h2>
          <p>
            Financial privacy is normal; using Parallax to break the law is not allowed. Deposits are screened by the network
            as they enter, and the swap flow is blocked from sanctioned countries and regions. See the{' '}
            <Link href="/terms">terms</Link> for acceptable use.
          </p>

          <h2 id="token">$PARALLAX</h2>
          <p>
            $PARALLAX is the community cryptocurrency, launching on pump.fun on Solana. It isn’t needed to use Parallax, carries no
            promised value or returns, and nothing here is financial advice.
          </p>
        </article>
      </div>
    </section>
  );
}
