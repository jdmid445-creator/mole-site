import Link from 'next/link';
import Mole from './Mole';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" aria-label="$TUNNEL home">
          <Mole size={36} id="mole-header" title="$TUNNEL logo" />
          <span className="brand-word">$TUNNEL</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#how">How it works</Link>
          <Link href="/#token">Token</Link>
          <Link href="/tunnel" className="btn btn-small">Open the Tunnel</Link>
        </nav>
      </div>
    </header>
  );
}
