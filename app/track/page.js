import TrackCrossing from '@/components/TrackCrossing';
import RecentCrossings from '@/components/RecentCrossings';

export const metadata = {
  title: 'Track a crossing — Parallax',
  description: 'Check the live status of a Parallax crossing with its deposit address.',
};

export default function TrackPage() {
  return (
    <section className="section tunnel-section">
      <div className="container">
        <h1 className="page-title hero-in" style={{ '--d': '80ms' }}>Track a crossing</h1>
        <p className="lede narrow hero-in" style={{ '--d': '200ms' }}>
          Paste the deposit address from your crossing to see where it is. Nothing is stored; the status comes straight from
          the swap network.
        </p>
        <div className="hero-in" style={{ '--d': '320ms' }}>
          <TrackCrossing />
          <RecentCrossings />
        </div>
      </div>
    </section>
  );
}
