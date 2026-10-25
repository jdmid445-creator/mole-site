'use client';

import { useEffect, useRef } from 'react';

const TEXT =
  'Every public swap draws a line between your wallets. Anyone can follow it. Parallax swaps across chains without leaving that line behind.';
const BARS = 72;

// Brand "light bars" (same as the X banner), moving in a slow wave behind the copy.
// Words light up one by one as the section scrolls through the screen.
export default function Statement() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const words = [...el.querySelectorAll('.st-word')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      words.forEach((w) => w.classList.add('is-lit'));
      return undefined;
    }
    let frame = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the band's top hits 85% of the screen, 1 when its middle reaches 40%
      const start = vh * 0.85;
      const end = vh * 0.4 - r.height / 2;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

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
    <div className="statement" ref={ref}>
      <div className="st-bars" aria-hidden="true">
        {bars.map((b, i) => (
          <span key={i} style={{ '--i': i, '--h': `${b.h}%`, '--c': b.c, '--o': b.o }} />
        ))}
      </div>
      <div className="st-veil" aria-hidden="true" />
      <div className="st-copy">
        <p className="kicker">Your wallets. Your business.</p>
        <p className="statement-text" aria-label={TEXT}>
          {TEXT.split(' ').map((w, i) => (
            <span key={i} className="st-word" aria-hidden="true">{w} </span>
          ))}
        </p>
      </div>
    </div>
  );
}
