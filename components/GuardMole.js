'use client';

import { useEffect, useRef, useState } from 'react';
import Mole from './Mole';

// The creature guarding the swap card. Tap him: he ducks, peeks back up to his eyes, squints,
// says something about keeping you private, then pops fully back up.
const LINES = [
  'Your funds, my tunnel. Nobody follows.',
  'I guard the gap between your wallets.',
  'No trail gets past me.',
  'I never hold your coins. Just your secret.',
  'Nobody connects the dots on my watch.',
];

export default function GuardMole({ variant = '' }) {
  const [phase, setPhase] = useState('hidden'); // hidden | rise | idle | down | peek | up
  const box = useRef(null);
  const [line, setLine] = useState('');
  const [bubble, setBubble] = useState(false);
  const next = useRef(Math.floor(Math.random() * LINES.length));
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Starts hidden below the edge; pops up the first time you scroll to him.
  useEffect(() => {
    let still = false;
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}
    if (still || typeof IntersectionObserver === 'undefined' || !box.current) { setPhase('idle'); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      timers.current.push(setTimeout(() => setPhase('rise'), 250));
      timers.current.push(setTimeout(() => setPhase('idle'), 900));
    }, { threshold: 0.6, rootMargin: '0px 0px -12% 0px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  function at(ms, fn) { timers.current.push(setTimeout(fn, ms)); }

  function tap() {
    if (phase !== 'idle') return;
    const text = LINES[next.current % LINES.length];
    next.current += 1;
    setLine(text);
    let still = false;
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}
    if (still) { setBubble(true); at(3000, () => setBubble(false)); return; }
    setPhase('down');
    at(320, () => setPhase('peek'));
    at(700, () => setBubble(true));
    at(3700, () => { setPhase('up'); setBubble(false); });
    at(4200, () => setPhase('idle'));
  }

  return (
    <>
    <span className={`guard-bubble${variant ? ' guard-bubble-' + variant : ''}${bubble ? ' is-on' : ''}`} role="status" aria-live="polite">{line}</span>
    <div ref={box} className={`guard${variant ? ' guard-' + variant : ''}`}>
      <button type="button" className={`guard-mole is-${phase}`} onClick={tap} aria-label="Tap the Parallax creature">
        <Mole size={150} id={`mole-guard${variant ? '-' + variant : ''}`} title="Parallax creature" />
      </button>
    </div>
    </>
  );
}
