import Link from 'next/link';
import Mole from './Mole';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" aria-label="$MOLE home">
          <Mole size={36} id="mole-header" title="$MOLE logo" />
          <span className="brand-word">$MOLE</span>
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
