import Link from 'next/link';
import Mole from '@/components/Mole';

export const metadata = { title: 'Parallax' };

export default function NotFound() {
  return (
    <section className="section">
      <div className="container center">
        <Mole size={220} id="mole-404" title="Parallax mascot" />
        <h1 className="page-title">Wrong tunnel.</h1>
        <p className="lede">This page doesn’t exist.</p>
        <Link href="/" className="btn">Back to the surface</Link>
      </div>
    </section>
  );
}
