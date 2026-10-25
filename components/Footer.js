import Link from 'next/link';
import Mole from './Mole';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Link href="/" className="brand" aria-label="Parallax home">
            <Mole size={30} id="mole-footer" />
            <span>Parallax</span>
          </Link>
          {SITE.xUrl ? (
            <a className="footer-x" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44z" /></svg>
              Follow us on X
            </a>
          ) : null}
        </div>
        <div className="footer-grid">
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
