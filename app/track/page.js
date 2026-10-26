import TrackCrossing from '@/components/TrackCrossing';
import RecentCrossings from '@/components/RecentCrossings';

export const metadata = {
  title: 'My Crossings — Parallax',
  description: 'Your recent Parallax crossings on this device, and live status for any crossing by its deposit address.',
};

export default function TrackPage() {
  return (
    <section className="section tunnel-section">
      <div className="container track-page">
        <h1 className="page-title hero-in" style={{ '--d': '80ms' }}>My Crossings</h1>
        <p className="lede narrow hero-in" style={{ '--d': '200ms' }}>
          Check the live status of any crossing, and find the ones you started on this device. Nothing is stored on our side.
        </p>
        <div className="hero-in" style={{ '--d': '320ms' }}>
          <div className="track-any">
            <h2 className="recent-title">Track any crossing</h2>
            <p className="muted small">Paste a deposit address (the address the coins were sent to) to see its live status.</p>
            <TrackCrossing />
          </div>
          <RecentCrossings title="Your crossings" showEmpty />
        </div>
      </div>
    </section>
  );
}
