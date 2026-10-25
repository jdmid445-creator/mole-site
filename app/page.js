import Link from 'next/link';
import HeroStage from '@/components/HeroStage';
import NetworkStatus from '@/components/NetworkStatus';
import TraceGame from '@/components/TraceGame';
import Statement from '@/components/Statement';
import ChainIcon from '@/components/ChainIcon';
import CopyButton from '@/components/CopyButton';
import { SITE, pumpUrl, dexUrl } from '@/lib/site';

const STEPS = [
  { title: 'Pick both ends', body: 'What you send and from where. What arrives, and the wallet it lands in.' },
  { title: 'Approve one transfer', body: 'One signature in your wallet. It goes straight to the swap network, never to us.' },
  { title: 'It crosses privately', body: 'NEAR Intents runs the swap in confidential mode. Our test route quoted about 24 seconds.' },
  { title: 'It arrives elsewhere', body: 'Your other wallet receives it from a network address. If anything fails, it’s refunded.' },
];

const CHAIN_ROW = [
  { key: 'sol', name: 'Solana' },
  { key: 'eth', name: 'Ethereum' },
  { key: 'base', name: 'Base' },
  { key: 'arb', name: 'Arbitrum' },
  { key: 'bsc', name: 'BNB Chain' },
  { key: 'avax', name: 'Avalanche' },
  { key: 'op', name: 'Optimism' },
  { key: 'pol', name: 'Polygon' },
  { key: 'btc', name: 'Bitcoin' },
  { key: 'doge', name: 'Dogecoin' },
  { key: 'ltc', name: 'Litecoin' },
  { key: 'xrp', name: 'XRP' },
  { key: 'tron', name: 'Tron' },
];

const FEATURES = [
  { title: 'Confidential routing', body: 'Swaps run in NEAR Intents’ confidential mode. No public line between wallets.', icon: 'M4 12h4m8 0h4 M9 12a3 3 0 106 0 3 3 0 00-6 0' },
  { title: 'Never custodial', body: 'Your wallet signs, the network delivers. We never hold funds or keys.', icon: 'M15 7a3 3 0 11-6 0 3 3 0 016 0z M12 10v11 M12 15h4 M12 18h3' },
  { title: 'Zero app fee', body: 'You only pay the network’s costs, shown in the quote before you send.', icon: 'M19 5L5 19 M7.5 7.5h.01 M16.5 16.5h.01 M9 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M18 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
  { title: 'Ghost wallets', body: 'Make a fresh wallet for the far side, right in your browser.', icon: 'M5 20V10a7 7 0 0114 0v10l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z M9.5 11h.01 M14.5 11h.01' },
  { title: 'Automatic refunds', body: 'If a swap can’t finish, it goes back to your refund address.', icon: 'M4 12a8 8 0 1 0 2.3-5.6 M4 4v4h4' },
  { title: 'Screened at the door', body: 'Every deposit enters a network that screens assets as they arrive.', icon: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4' },
  { title: 'Closed where sanctioned', body: 'Swaps are blocked from sanctioned countries and regions.', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18z M5.6 5.6l12.8 12.8' },
  { title: 'No accounts, no logs', body: 'No sign-ups and no stored swap history.', icon: 'M3 3l18 18 M10.6 6.1A9.8 9.8 0 0112 6c5 0 9 6 9 6a17 17 0 01-2.6 3.3 M6.3 7.6C4.1 9.2 3 12 3 12s4 6 9 6c1.3 0 2.5-.3 3.6-.8 M9.9 9.9a3 3 0 004.2 4.2' },
];

const PRODUCTS = [
  { title: 'Private crossing', body: 'Swap between 13 chains with no public link between the wallet you send from and the one you receive in.', href: '/tunnel', cta: 'Launch app', chains: ['sol', 'eth', 'btc'] },
  { title: 'Ghost wallets', body: 'A brand-new wallet with no history for Solana, EVM chains, Bitcoin, Dogecoin, Litecoin, XRP and Tron.', href: '/ghost', cta: 'Create one', chains: ['doge', 'xrp', 'tron'] },
  { title: 'Track a crossing', body: 'Paste a deposit address and follow it from deposit to arrival. Nothing is stored.', href: '/track', cta: 'Track', chains: ['base', 'arb', 'ltc'] },
];

const FAQ = [
  {
    q: 'Is Parallax a mixer?',
    a: 'No. Parallax never holds your funds. You send straight to NEAR Intents’ swap network, which screens assets as they come in and delivers to the wallet you choose.',
  },
  {
    q: 'Why the name Parallax?',
    a: 'Seen from one chain, your coins left. Seen from the other, they arrived. Each chain only sees its own half of the trip, and nothing public joins the two.',
  },
  {
    q: 'Is it anonymous?',
    a: 'No tool makes you anonymous. Parallax hides the public link between your two wallets. Your deposit and the arrival are still public on their own chains, so round amounts and a little patience help.',
  },
  {
    q: 'What does it cost?',
    a: 'Parallax charges no app fee. You pay the network’s swap and gas costs, which are already included in the quote you see before sending.',
  },
  {
    q: 'How long does a crossing take?',
    a: 'Usually under a minute. Our test quote for SOL to ETH on Base estimated about 24 seconds. Bitcoin is slower because blocks are slower.',
  },
  {
    q: 'What if something goes wrong?',
    a: 'If a swap can’t complete, the network refunds it to your refund address, which is the wallet you sent from unless you enter another.',
  },
  {
    q: 'Which wallets work?',
    a: 'Phantom, Solflare and Backpack on Solana. MetaMask, Rabby and Coinbase Wallet on Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche and BNB Chain. For Bitcoin, Dogecoin, Litecoin, XRP and Tron, send from any wallet to the deposit address shown.',
  },
  {
    q: 'Do I need $PARALLAX to use it?',
    a: 'No. Parallax is free for everyone. $PARALLAX is the token for the community around it.',
  },
];

export default function Home() {
  const ca = SITE.tokenContract;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-panel">
            <div className="hero-grid">
              <div className="hero-copy">
                <h1 className="hero-title hero-in" style={{ '--d': '60ms' }}>Swap crypto privately, across any chain.</h1>
                <p className="lede hero-in" style={{ '--d': '140ms' }}>
                  Send from one wallet, receive in another, with no public link between them. Non-custodial. Zero app fee.
                </p>
                <div className="cta-row hero-in" style={{ '--d': '220ms' }}>
                  <Link href="/tunnel" className="btn">Launch app</Link>
                  <Link href="/ghost" className="btn btn-ghost">Create a ghost wallet</Link>
                </div>
                <div className="hero-in" style={{ '--d': '300ms' }}>
                  <NetworkStatus />
                </div>
              </div>
              <HeroStage />
            </div>

            <div className="hero-chains" aria-label="Supported chains">
              <p className="kicker">Swap across 13 chains</p>
              <ul className="chain-row" data-reveal>
                {CHAIN_ROW.map((c, i) => (
                  <li key={c.name} style={{ '--i': i }}>
                    <ChainIcon chain={c.key} size={26} />
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="stats" aria-label="At a glance" data-reveal>
              <li><strong>13</strong><span>Chains supported</span></li>
              <li><strong>100+</strong><span>Assets to swap</span></li>
              <li><strong>0%</strong><span>App fee</span></li>
              <li><strong>0</strong><span>Funds held by us</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="products" className="section">
        <div className="container">
          <h2 className="section-title" data-reveal>The privacy toolkit</h2>
          <div className="panel" data-reveal>
            <div className="panel-head">
              <span>Parallax</span>
              <Link href="/tunnel" className="btn btn-small">Launch app</Link>
            </div>
            <ul className="products">
              {PRODUCTS.map((p) => (
                <li key={p.title} className="product">
                  <span className="product-icons" aria-hidden="true">
                    {p.chains.map((c) => <ChainIcon key={c} chain={c} size={30} />)}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <Link href={p.href} className="btn btn-ghost btn-small">{p.cta}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-flush">
        <div className="container">
          <Statement />
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
                    <h2 className="section-title" data-reveal>How a crossing works</h2>
          <ol className="timeline" data-reveal>
            {STEPS.map((s, i) => (
              <li key={s.title} style={{ '--i': i }}>
                <span className="timeline-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
                    <h2 className="section-title" data-reveal>Private, not shady</h2>
          <p className="lede narrow" data-reveal>Privacy for normal people, not cover for bad actors.</p>
          <ul className="features" data-reveal>
            {FEATURES.map((c, i) => (
              <li key={c.title} style={{ '--i': i }}>
                <svg className="feature-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={c.icon} />
                </svg>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
          <p className="built-on" data-reveal>
            <span className="built-on-label">Built on</span>
            <span className="built-on-name">NEAR Intents</span>
            <span className="built-on-name">Helius</span>
            <span className="built-on-name">Solana</span>
          </p>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container faq-wrap">
          <h2 className="section-title" data-reveal>Frequently asked questions</h2>
          <div className="faq" data-reveal>
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="token" className="section">
        <div className="container token-grid" data-reveal>
          <div>
            <h2 className="section-title">$PARALLAX</h2>
            <p className="lede narrow">
              The token for the community behind Parallax, launching on pump.fun. Parallax itself stays free.
            </p>
          </div>
          <dl className="facts">
            <div>
              <dt>CA</dt>
              <dd>
                {ca ? (
                  <span className="mono-row">
                    <code className="mono">{ca}</code>
                    <CopyButton value={ca} />
                  </span>
                ) : (
                  <span className="muted">Posted here at launch. Ignore any address you see before then.</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Dev wallet</dt>
              <dd>
                {SITE.devWallet ? (
                  <span className="mono-row">
                    <code className="mono">{SITE.devWallet}</code>
                    <CopyButton value={SITE.devWallet} />
                  </span>
                ) : (
                  <span className="muted">Published at launch, so anyone can watch it.</span>
                )}
              </dd>
            </div>
            {ca ? (
              <div>
                <dt>Charts</dt>
                <dd className="link-row">
                  <a href={dexUrl(ca)} target="_blank" rel="noopener noreferrer">DexScreener</a>
                  <a href={pumpUrl(ca)} target="_blank" rel="noopener noreferrer">pump.fun</a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <section id="trace" className="section trace-section">
        <div className="container">
          <h2 className="section-title" data-reveal>Try to trace it</h2>
          <p className="lede narrow" data-reveal>
            You’re the one watching the chains. Match each deposit to the arrival it became, then switch habits and try again.
          </p>
          <div data-reveal>
            <TraceGame />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="closing-card" data-reveal>
            <h2>Ready to cross?</h2>
            <p className="lede">No account, no app fee. Pick both ends and go.</p>
            <Link href="/tunnel" className="btn">Launch app</Link>
          </div>
        </div>
      </section>
    </>
  );
}
