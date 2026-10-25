import Link from 'next/link';
import Mole from '@/components/Mole';

export const metadata = { title: 'Not available in your region — Parallax', robots: { index: false } };

export default function Unavailable() {
  return (
    <section className="section">
      <div className="container center">
        <Mole size={200} id="mole-unavailable" title="Parallax mascot" />
        <h1 className="page-title">Not available in your region</h1>
        <p className="lede">
          Parallax can’t be used from sanctioned countries and regions. You can still read about how it works.
        </p>
        <Link href="/" className="btn btn-ghost">Back to the home page</Link>
      </div>
    </section>
  );
}
