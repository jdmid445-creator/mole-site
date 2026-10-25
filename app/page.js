import Link from 'next/link';
import HeroStage from '@/components/HeroStage';
import NetworkStatus from '@/components/NetworkStatus';
import TraceGame from '@/components/TraceGame';
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

const CLEAN = [
  {
    title: 'Screened at the door',
    body: 'Every deposit enters NEAR Intents’ network, which screens assets as they come in.',
    icon: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4',
  },
  {
    title: 'Never custodial',
    body: 'Your wallet signs, the network delivers. Parallax never holds funds or private keys.',
    icon: 'M15 7a3 3 0 11-6 0 3 3 0 016 0z M12 10v11 M12 15h4 M12 18h3',
  },
  {
    title: 'Closed where sanctioned',
    body: 'Swaps are blocked from comprehensively sanctioned countries and regions.',
    icon: 'M12 21a9 9 0 100-18 9 9 0 000 18z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z M5 5l14 14',
  },
  {
    title: 'No accounts, no logs',
    body: 'No sign-ups and no stored swap history. Your last route is remembered only in your own browser.',
    icon: 'M3 3l18 18 M10.6 6.1A9.8 9.8 0 0112 6c5 0 9 6 9 6a17 17 0 01-2.6 3.3 M6.3 7.6C4.1 9.2 3 12 3 12s4 6 9 6c1.3 0 2.5-.3 3.6-.8 M9.9 9.9a3 3 0 004.2 4.2',
  },
];

const FAQ = [
  {
    q: 'Is Parallax a mixer?',
    a: 'No. Parallax never holds your funds. You send straight to NEAR Intents’ swap network, which screens assets as they come in and delivers to the wallet you choose.',
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
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="line"><span className="line-inner">Seen from one chain,</span></span>
              <span className="line"><span className="line-inner">it left. Seen from</span></span>
              <span className="line"><span className="line-inner">the other, it arrived.</span></span>
            </h1>
            <p className="lede hero-in" style={{ '--d': '560ms' }}>
              Parallax swaps your crypto across chains, from SOL to ETH, BTC and more, with no public line between the wallet
              you send from and the one you receive in.
            </p>
            <div className="cta-row hero-in" style={{ '--d': '680ms' }}>
              <Link href="/tunnel" className="btn">Make a crossing</Link>
              <Link href="/#how" className="btn btn-ghost">See how it works</Link>
            </div>
            <p className="hero-note hero-in" style={{ '--d': '800ms' }}>Your funds never touch us. No app fee. Runs on NEAR Intents.</p>
            <div className="hero-in" style={{ '--d': '920ms' }}>
              <NetworkStatus />
            </div>
          </div>
          <HeroStage />
        </div>
      </section>

      <section className="chain-band" aria-label="Supported chains">
        <div className="container">
          <ul className="chain-row" data-reveal>
            {CHAIN_ROW.map((c, i) => (
              <li key={c.name} style={{ '--i': i }}>
                <ChainIcon chain={c.key} size={32} />
                {c.name}
              </li>
            ))}
          </ul>
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

      <section id="views" className="section views-section">
        <div className="container">
          <h2 className="section-title" data-reveal>Two views, no line</h2>
          <p className="lede narrow" data-reveal>
            That’s where the name comes from. Each chain only ever sees its own half of the trip.
          </p>

          <div className="views" data-reveal>
            <figure className="view view-from">
              <figcaption>What Solana sees</figcaption>
              <dl>
                <div><dt>From</dt><dd>Your wallet</dd></div>
                <div><dt>To</dt><dd>A swap network deposit address</dd></div>
                <div><dt>Amount</dt><dd>0.1 SOL</dd></div>
              </dl>
            </figure>

            <div className="views-gap" aria-hidden="true">
              <span className="views-break" />
              <span className="views-gap-label">no public link</span>
              <span className="views-break" />
            </div>

            <figure className="view view-to">
              <figcaption>What Base sees</figcaption>
              <dl>
                <div><dt>From</dt><dd>A network address</dd></div>
                <div><dt>To</dt><dd>A fresh wallet</dd></div>
                <div><dt>Amount</dt><dd>0.0043 ETH</dd></div>
              </dl>
            </figure>
          </div>

          <p className="fine" data-reveal>
            Private, not invisible: both halves are public on their own chains. Round amounts, waiting a bit between crossings,
            and never sending directly between your two wallets keep them hard to match.
          </p>
        </div>
      </section>

      <section id="clean" className="section">
        <div className="container">
          <h2 className="section-title" data-reveal>Keeping it clean</h2>
          <p className="lede narrow" data-reveal>Privacy for normal people, not cover for bad actors.</p>
          <ul className="clean-grid" data-reveal>
            {CLEAN.map((c, i) => (
              <li key={c.title} style={{ '--i': i }}>
                <svg className="clean-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={c.icon} />
                </svg>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
          <div className="built-on" data-reveal>
            <span className="built-on-label">Built on</span>
            <span className="built-on-name">NEAR Intents</span>
            <span className="built-on-name">Helius</span>
            <span className="built-on-name">Solana</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ul className="facts-row" aria-label="At a glance" data-reveal>
            <li style={{ '--i': 0 }}><strong>1</strong><span>signature to send</span></li>
            <li style={{ '--i': 1 }}><strong>0</strong><span>funds ever held by Parallax</span></li>
            <li style={{ '--i': 2 }}><strong>0%</strong><span>app fee</span></li>
            <li style={{ '--i': 3 }}><strong>13</strong><span>chains, from Solana and Ethereum to Bitcoin, XRP and Tron</span></li>
          </ul>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container faq-grid">
          <h2 className="section-title" data-reveal>Questions</h2>
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
              <dt>Contract</dt>
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

      <section className="section closing">
        <div className="container closing-inner" data-reveal>
          <h2>Ready to cross?</h2>
          <Link href="/tunnel" className="btn">Make a crossing</Link>
        </div>
      </section>
    </>
  );
}
