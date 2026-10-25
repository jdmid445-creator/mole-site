import Link from 'next/link';
import Mole from './Mole';
import { SITE } from '@/lib/site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" aria-label="Parallax home">
          <Mole size={36} id="mole-header" title="Parallax logo" />
          <span className="brand-word">Parallax</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#how">How it works</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/ghost">Ghost wallet</Link>
          <Link href="/track">Track</Link>
          <Link href="/#token">$PARALLAX</Link>
          {SITE.xUrl ? (
            <a href={SITE.xUrl} className="nav-x" target="_blank" rel="noopener noreferrer" aria-label="Parallax on X">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          ) : null}
          <Link href="/tunnel" className="btn btn-small">Launch app</Link>
        </nav>
      </div>
    </header>
  );
}
