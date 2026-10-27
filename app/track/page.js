import TrackCrossing from '@/components/TrackCrossing';
import RecentCrossings from '@/components/RecentCrossings';
import GuardMole from '@/components/GuardMole';

export const metadata = {
  title: 'Parallax',
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
          <div className="peek-stage peek-track">
            <GuardMole variant="track" intro="Let’s check your crossing." />
            <RecentCrossings title="Your crossings" showEmpty />
          </div>
        </div>
      </div>
    </section>
  );
}
