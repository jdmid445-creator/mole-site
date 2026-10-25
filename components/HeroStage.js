'use client';

import { useEffect, useRef, useState } from 'react';
import Mole from './Mole';

// The parallax hero: two chain "planes" at different depths with the creature between them.
// Layers drift with the pointer; nothing moves for people who prefer reduced motion.
export default function HeroStage() {
  const ref = useRef(null);
  const [ducking, setDucking] = useState(false);
  const [boops, setBoops] = useState(0);

  function boop() {
    if (ducking) return;
    setDucking(true);
    setBoops((n) => n + 1);
    setTimeout(() => setDucking(false), 1100);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduce || !finePointer) return undefined;

    let frame = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--mx', Math.max(-1, Math.min(1, x)).toFixed(3));
        el.style.setProperty('--my', Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="stage" ref={ref}>
      <div className="plane plane-back" aria-hidden="true">
        <span className="plane-name">Solana</span>
        <span className="plane-event">
          <span className="dot dot-out" /> 0.1 SOL left your wallet
        </span>
      </div>
      <button
        type="button"
        className={`stage-mole${ducking ? ' is-ducking' : ''}`}
        onClick={boop}
        aria-label="Boop the Parallax creature"
      >
        <Mole size={300} id="mole-stage" title="Parallax creature" />
        <span className="boop-hint" aria-live="polite">
          {boops === 0 ? 'click me' : ducking ? 'gone.' : `${boops} boop${boops === 1 ? '' : 's'}`}
        </span>
      </button>
      <div className="plane plane-front" aria-hidden="true">
        <span className="plane-name">Base</span>
        <span className="plane-event">
          <span className="dot dot-in" /> 0.0043 ETH arrived somewhere
        </span>
      </div>
    </div>
  );
}
