import Link from 'next/link';
import Mole from '@/components/Mole';
import CopyButton from '@/components/CopyButton';
import { SITE, pumpUrl, dexUrl } from '@/lib/site';
import { CHAINS } from '@/lib/chains';

export default function Home() {
  const ca = SITE.tokenContract;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">$MOLE · tunnels between chains</p>
            <h1>A private tunnel between any two chains.</h1>
            <p className="lede">
              Send SOL, ETH, BTC and more into a wallet on another chain, with no public link between the wallet you
              send from and the one you receive in.
            </p>
            <div className="cta-row">
              <Link href="/tunnel" className="btn">Open the Tunnel</Link>
              {ca ? (
                <a href={pumpUrl(ca)} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">Buy $MOLE</a>
              ) : (
                <span className="btn btn-ghost is-disabled" aria-disabled="true">$MOLE launching soon</span>
              )}
            </div>
            <ul className="chain-list" aria-label="Supported chains">
              {CHAINS.map((c) => (
                <li key={c.key}>{c.label}</li>
              ))}
            </ul>
          </div>
          <div className="hero-art">
            <Mole size={420} id="mole-hero" />
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <h2>How the Tunnel works</h2>
          <ol className="steps">
            <li>
              <span className="step-num">01</span>
              <h3>Pick both ends</h3>
              <p>Choose what you send (say, SOL from Phantom) and what arrives on the other side (say, ETH on Base), plus the wallet it lands in.</p>
            </li>
            <li>
              <span className="step-num">02</span>
              <h3>Send once</h3>
              <p>Approve one transfer. It goes straight into NEAR Intents' confidential network. We never hold your funds.</p>
            </li>
            <li>
              <span className="step-num">03</span>
              <h3>Arrive elsewhere</h3>
              <p>The swap runs privately and lands in your destination wallet from a network address. If anything fails, it's refunded.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Private, not invisible</h2>
          <p className="lede narrow">We'd rather tell you exactly what the Tunnel does than overpromise.</p>
          <div className="two-col">
            <div className="card">
              <h3>Hidden</h3>
              <ul className="ticks">
                <li>The public link between your sending and receiving wallets</li>
                <li>Amounts, timing and routing inside the network</li>
                <li>Which wallet on the other side is yours</li>
              </ul>
            </div>
            <div className="card">
              <h3>Still visible</h3>
              <ul className="dashes">
                <li>Your deposit into the network, from your sending wallet</li>
                <li>The arrival in your receiving wallet, from a network address</li>
                <li>Patterns, if you send an exact amount and receive it seconds later</li>
              </ul>
            </div>
          </div>
          <p className="muted small">
            Tips: use round amounts, don't move everything at once, and never send directly between the two wallets outside the Tunnel.
            That links them publicly forever.
          </p>
        </div>
      </section>

      <section id="token" className="section">
        <div className="container token-grid">
          <div>
            <h2>The token</h2>
            <p className="lede narrow">
              $MOLE is the meme behind the Tunnel. It launches on pump.fun on Solana. The Tunnel itself is free to use and
              charges no app fee.
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
                  <span className="muted">Published at launch. Private for holders, transparent dev.</span>
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
    </>
  );
}
