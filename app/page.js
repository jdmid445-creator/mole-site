import Link from 'next/link';
import HeroStage from '@/components/HeroStage';
import CopyButton from '@/components/CopyButton';
import { SITE, pumpUrl, dexUrl } from '@/lib/site';

const STEPS = [
  { title: 'Pick both ends', body: 'What you send and from where. What arrives, and the wallet it lands in.' },
  { title: 'Approve one transfer', body: 'One signature in your wallet. It goes straight to the swap network, never to us.' },
  { title: 'It crosses privately', body: 'NEAR Intents runs the swap in confidential mode. Our test route quoted about 24 seconds.' },
  { title: 'It arrives elsewhere', body: 'Your other wallet receives it from a network address. If anything fails, it’s refunded.' },
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
    a: 'Phantom, Solflare and Backpack on Solana. MetaMask, Rabby and Coinbase Wallet on Ethereum, Base, Arbitrum and BNB Chain. For Bitcoin, send from any wallet to the deposit address shown.',
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
            <h1>Seen from one chain, it left. Seen from the other, it arrived.</h1>
            <p className="lede">
              Parallax swaps your crypto across chains, from SOL to ETH, BTC and more, with no public line between the wallet
              you send from and the one you receive in.
            </p>
            <div className="cta-row">
              <Link href="/tunnel" className="btn">Make a crossing</Link>
              <Link href="/#how" className="btn btn-ghost">See how it works</Link>
            </div>
            <p className="hero-note">Your funds never touch us. No app fee. Runs on NEAR Intents.</p>
          </div>
          <HeroStage />
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <h2 className="section-title">How a crossing works</h2>
          <ol className="timeline">
            {STEPS.map((s, i) => (
              <li key={s.title}>
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
          <h2 className="section-title">Two views, no line</h2>
          <p className="lede narrow">
            That’s where the name comes from. Each chain only ever sees its own half of the trip.
          </p>

          <div className="views">
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

          <p className="fine">
            Private, not invisible: both halves are public on their own chains. Round amounts, waiting a bit between crossings,
            and never sending directly between your two wallets keep them hard to match.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ul className="facts-row" aria-label="At a glance">
            <li><strong>1</strong><span>signature to send</span></li>
            <li><strong>0</strong><span>funds ever held by Parallax</span></li>
            <li><strong>0%</strong><span>app fee</span></li>
            <li><strong>6</strong><span>chains: Solana, Ethereum, Base, Arbitrum, BNB Chain, Bitcoin</span></li>
          </ul>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container faq-grid">
          <h2 className="section-title">Questions</h2>
          <div className="faq">
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
        <div className="container token-grid">
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

      <section className="section closing">
        <div className="container closing-inner">
          <h2>Ready to cross?</h2>
          <Link href="/tunnel" className="btn">Make a crossing</Link>
        </div>
      </section>
    </>
  );
}
