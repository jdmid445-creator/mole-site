import Link from 'next/link';
import Mole from './Mole';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="Parallax home">
              <Mole size={30} id="mole-footer" />
              <span>Parallax</span>
            </Link>
            <p className="muted small">Private cross-chain swaps. Non-custodial, zero app fee.</p>
            {SITE.xUrl ? (
              <a className="footer-x" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">Follow us on X</a>
            ) : null}
          </div>
          <nav className="footer-col" aria-label="App">
            <h4>App</h4>
            <Link href="/tunnel">Make a crossing</Link>
            <Link href="/ghost">Ghost wallet</Link>
            <Link href="/track">Track a crossing</Link>
          </nav>
          <nav className="footer-col" aria-label="Learn">
            <h4>Learn</h4>
            <Link href="/#how">How it works</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/#faq">FAQ</Link>
          </nav>
          <nav className="footer-col" aria-label="Community">
            <h4>Community</h4>
            <Link href="/#token">$PARALLAX</Link>
            {SITE.xUrl ? <a href={SITE.xUrl} target="_blank" rel="noopener noreferrer">X (@parallaxswap)</a> : null}
            {SITE.telegramUrl ? <a href={SITE.telegramUrl} target="_blank" rel="noopener noreferrer">Telegram</a> : null}
            <Link href="/terms">Terms &amp; privacy limits</Link>
          </nav>
        </div>
        <p className="footer-legal">
          $PARALLAX is a meme coin with no promised value or returns. Parallax runs on NEAR Intents and is not affiliated with
          NEAR. Nothing here is financial advice.
        </p>
      </div>
    </footer>
  );
}
