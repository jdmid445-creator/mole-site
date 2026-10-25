import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <p className="muted small">
          $TUNNEL is a meme coin with no promised value or returns. The Tunnel runs on NEAR Intents and is not affiliated with NEAR.
          Nothing here is financial advice.
        </p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/terms">Terms &amp; privacy limits</Link>
          {SITE.xUrl ? <a href={SITE.xUrl} target="_blank" rel="noopener noreferrer">X</a> : null}
          {SITE.telegramUrl ? <a href={SITE.telegramUrl} target="_blank" rel="noopener noreferrer">Telegram</a> : null}
        </nav>
      </div>
    </footer>
  );
}
