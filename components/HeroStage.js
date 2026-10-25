'use client';

import { useEffect, useRef } from 'react';
import Mole from './Mole';

// The parallax hero: two chain "planes" at different depths with the creature between them.
// Layers drift with the pointer; nothing moves for people who prefer reduced motion.
export default function HeroStage() {
  const ref = useRef(null);

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
    <div className="stage" ref={ref} aria-hidden="true">
      <div className="plane plane-back">
        <span className="plane-name">Solana</span>
        <span className="plane-event">
          <span className="dot dot-out" /> 0.1 SOL left your wallet
        </span>
      </div>
      <div className="stage-mole">
        <Mole size={300} id="mole-stage" title="Parallax creature" />
      </div>
      <div className="plane plane-front">
        <span className="plane-name">Base</span>
        <span className="plane-event">
          <span className="dot dot-in" /> 0.0043 ETH arrived somewhere
        </span>
      </div>
    </div>
  );
}
