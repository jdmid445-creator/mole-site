'use client';

import { useEffect, useRef, useState } from 'react';
import Mole from './Mole';

// The creature guarding the swap card. Tap him: he ducks, peeks back up to his eyes, squints,
// says something about keeping you private, then pops fully back up.
export const LINES = [
  'Your funds, my tunnel. Nobody follows.',
  'I guard the gap between your wallets.',
  'No trail gets past me.',
  'I never hold your coins. Just your secret.',
  'Nobody connects the dots on my watch.',
];

export default function GuardMole({ variant = '', intro = '' }) {
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
    // Wait until the person stops scrolling with him in view, then pop up and say a line.
    let inView = false, done = false, settle = 0;
    const go = () => {
      if (done || !inView) return;
      done = true; io.disconnect(); window.removeEventListener('scroll', onScroll);
      let text = intro;
      if (!text) { text = LINES[next.current % LINES.length]; next.current += 1; }
      setLine(text);
      setPhase('rise');
      timers.current.push(setTimeout(() => setBubble(true), 450));
      timers.current.push(setTimeout(() => setPhase('idle'), 900));
      timers.current.push(setTimeout(() => setBubble(false), 3900));
    };
    const onScroll = () => { clearTimeout(settle); settle = setTimeout(go, 280); };
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      clearTimeout(settle); if (inView) settle = setTimeout(go, 280);
    }, { threshold: 0.5 });
    io.observe(box.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); clearTimeout(settle); };
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
