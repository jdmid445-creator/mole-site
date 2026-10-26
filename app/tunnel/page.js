import TunnelApp from '@/components/TunnelApp';
import NetworkStatus from '@/components/NetworkStatus';
import GuardMole from '@/components/GuardMole';

export const metadata = {
  title: 'Make a crossing — Parallax',
  description: 'Move value privately between chains. Non-custodial, powered by NEAR Intents confidential swaps.',
};

export default function TunnelPage() {
  return (
    <section className="section tunnel-section">
      <div className="container">
        <h1 className="page-title hero-in" style={{ '--d': '80ms' }}>Make a crossing</h1>
        <p className="lede narrow hero-in" style={{ '--d': '200ms' }}>
          Pick both ends, send once, arrive elsewhere. Your funds go straight into NEAR Intents’ confidential network.
          This site never holds them.
        </p>
        <div className="hero-in tunnel-status" style={{ '--d': '260ms' }}>
          <NetworkStatus />
        </div>
        <div className="hero-in tunnel-stage" style={{ '--d': '320ms' }}>
          <GuardMole />
          <TunnelApp />
        </div>
      </div>
    </section>
  );
}
