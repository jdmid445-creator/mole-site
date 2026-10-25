const TEXT =
  'Every public swap draws a line between your wallets. Anyone can follow it. Parallax swaps across chains without leaving that line behind.';
const BARS = 72;

// Brand "light bars" (same as the X banner), moving in a slow wave behind static copy.
export default function Statement() {
  const bars = Array.from({ length: BARS }, (_, i) => {
    const t = i / (BARS - 1);
    const env = Math.sin(t * Math.PI); // taller in the middle
    const lerp = (a, b, u) => Math.round(a + (b - a) * u);
    let c;
    if (t < 0.6) {
      const u = t / 0.6;
      c = `rgb(${lerp(90, 207, u)},${lerp(65, 198, u)},${lerp(214, 255, u)})`;
    } else {
      const u = (t - 0.6) / 0.4;
      c = `rgb(${lerp(207, 200, u)},${lerp(198, 255, u)},${lerp(255, 46, u)})`;
    }
    return { h: 30 + env * 70, c, o: (0.35 + 0.6 * env).toFixed(2) };
  });

  return (
    <div className="statement">
      <div className="st-bars" aria-hidden="true">
        {bars.map((b, i) => (
          <span key={i} style={{ '--i': i, '--h': `${b.h}%`, '--c': b.c, '--o': b.o }} />
        ))}
      </div>
      <div className="st-veil" aria-hidden="true" />
      <div className="st-copy" data-reveal>
        <p className="kicker">Your wallets. Your business.</p>
        <p className="statement-text">{TEXT}</p>
      </div>
    </div>
  );
}
