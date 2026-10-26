import TrackCrossing from '@/components/TrackCrossing';
import RecentCrossings from '@/components/RecentCrossings';

export const metadata = {
  title: 'My crossings — Parallax',
  description: 'Your recent Parallax crossings on this device, and live status for any crossing by its deposit address.',
};

export default function TrackPage() {
  return (
    <section className="section tunnel-section">
      <div className="container track-page">
        <h1 className="page-title hero-in" style={{ '--d': '80ms' }}>My crossings</h1>
        <p className="lede narrow hero-in" style={{ '--d': '200ms' }}>
          Crossings you started on this device, with their live status. Nothing is stored on our side.
        </p>
        <div className="hero-in" style={{ '--d': '320ms' }}>
          <RecentCrossings title="On this device" showEmpty />
          <div className="track-any">
            <h2 className="recent-title">Track any crossing</h2>
            <p className="muted small">Started it somewhere else? Paste its deposit address (the address the coins were sent to).</p>
            <TrackCrossing />
          </div>
        </div>
      </div>
    </section>
  );
}
