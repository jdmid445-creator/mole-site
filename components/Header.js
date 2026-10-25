import Link from 'next/link';
import Mole from './Mole';

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
          <Link href="/#faq">Questions</Link>
          <Link href="/#token">$PARALLAX</Link>
          <Link href="/tunnel" className="btn btn-small">Make a crossing</Link>
        </nav>
      </div>
    </header>
  );
}
