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

export default function GuardMole() {
  const [phase, setPhase] = useState('idle'); // idle | down | peek | up
  const [line, setLine] = useState('');
  const [bubble, setBubble] = useState(false);
  const next = useRef(Math.floor(Math.random() * LINES.length));
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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
    <span className={`guard-bubble${bubble ? ' is-on' : ''}`} role="status" aria-live="polite">{line}</span>
    <div className="guard">
      <button type="button" className={`guard-mole is-${phase}`} onClick={tap} aria-label="Tap the Parallax creature">
        <Mole size={150} id="mole-guard" title="Parallax creature" />
      </button>
    </div>
    </>
  );
}
