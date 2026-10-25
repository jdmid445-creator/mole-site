import TunnelApp from '@/components/TunnelApp';

export const metadata = {
  title: 'The Tunnel — $MOLE',
  description: 'Move value privately between chains. Non-custodial, powered by NEAR Intents confidential swaps.',
};

export default function TunnelPage() {
  return (
    <section className="section tunnel-section">
      <div className="container">
        <h1 className="page-title">The Tunnel</h1>
        <p className="lede narrow">
          Pick both ends, send once, arrive elsewhere. Your funds go straight into NEAR Intents' confidential network.
          This site never holds them.
        </p>
        <TunnelApp />
      </div>
    </section>
  );
}
