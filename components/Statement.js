'use client';

import { useEffect, useRef, useState } from 'react';

const TEXT =
  'Every public swap draws a line between your wallets. Anyone can follow it. Parallax swaps across chains without leaving that line behind.';
const BARS = 72;

// Brand "light bars" behind static copy. When the band settles on screen, the creature chomps
// across it Pac-Man style and eats the line; the words light up behind him, then the bars grow back.
export default function Statement() {
  const ref = useRef(null);
  const pac = useRef(null);
  const mouth = useRef(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    let still = false;
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}
    if (!el || still || !('IntersectionObserver' in window)) { setLit(true); return undefined; }

    let inView = false, running = false, settle = 0, raf = 0, regrow = 0, lastRun = -1e9;
    const spans = () => [...el.querySelectorAll('.st-bars span')];

    function run() {
      if (running || !inView || performance.now() - lastRun < 9000) return;
      running = true; lastRun = performance.now();
      const box = el.getBoundingClientRect();
      const bars = spans().map((s) => { const r = s.getBoundingClientRect(); return { s, x: r.left + r.width / 2 - box.left, eaten: false }; });
      bars.forEach((b) => { b.s.classList.remove('is-eaten', 'is-regrow'); });
      const size = pac.current.offsetWidth;
      const from = -size, to = box.width + size;
      const dur = Math.max(2600, ((to - from) / 300) * 1000);
      const t0 = performance.now();
      pac.current.style.opacity = '1';
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const x = from + (to - from) * k;
        const bob = Math.sin(now / 90) * 2;
        pac.current.style.transform = `translate(${x.toFixed(1)}px, ${bob.toFixed(1)}px)`;
        const a = 34 * Math.abs(Math.sin((now - t0) / 1000 * Math.PI * 3.6)) + 2; // chomp
        const r = 46, rad = (a * Math.PI) / 180, cx = 50 + r * Math.cos(rad), cy = r * Math.sin(rad);
        mouth.current.setAttribute('d', `M50 50 L${cx.toFixed(2)} ${(50 - cy).toFixed(2)} A${r} ${r} 0 1 0 ${cx.toFixed(2)} ${(50 + cy).toFixed(2)} Z`);
        const mouthX = x + size * 0.72;
        bars.forEach((b) => { if (!b.eaten && b.x < mouthX) { b.eaten = true; b.s.classList.add('is-eaten'); } });
        if (k > 0.55) setLit(true);
        if (k < 1) { raf = requestAnimationFrame(step); return; }
        pac.current.style.opacity = '0';
        regrow = setTimeout(() => {
          bars.forEach((b) => { b.s.classList.add('is-regrow'); b.s.classList.remove('is-eaten'); });
          running = false;
        }, 1400);
      };
      raf = requestAnimationFrame(step);
    }

    const onScroll = () => { clearTimeout(settle); settle = setTimeout(run, 280); };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting && e.intersectionRatio >= 0.55;
      clearTimeout(settle); if (inView) settle = setTimeout(run, 280);
    }, { threshold: [0, 0.55] });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); clearTimeout(settle); clearTimeout(regrow); cancelAnimationFrame(raf); };
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
      <div className="st-pac" ref={pac} aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <defs>
            <radialGradient id="pac-body" cx="38%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#9A86FF" />
              <stop offset="55%" stopColor="#5A41D6" />
              <stop offset="100%" stopColor="#2A1C7A" />
            </radialGradient>
          </defs>
          <path ref={mouth} d="M50 50 L96 50 A46 46 0 1 0 96 50 Z" fill="url(#pac-body)" />
          <ellipse cx="54" cy="27" rx="5" ry="7.5" fill="#C8FF2E" />
        </svg>
      </div>
      <div className={`st-copy${lit ? ' is-lit' : ''}`}>
        <p className="kicker">Your wallets. Your business.</p>
        <p className="statement-text">{TEXT}</p>
      </div>
    </div>
  );
}
