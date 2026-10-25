'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Mole from './Mole';
import ChainIcon from './ChainIcon';

// Hero visual: a clean preview of the swap box, with the creature peeking over the top.
// The creature is alive: eyes follow the pointer (glance around when idle), a soft bob and an
// occasional wiggle, a one-time "boop me" hint, and a happy squint after he ducks and pops back.
const HINT_KEY = 'parallax-booped';

export default function HeroStage() {
  const [ducking, setDucking] = useState(false);
  const [idle, setIdle] = useState(true);
  const [hint, setHint] = useState(false);
  const [booped, setBooped] = useState(false);
  const btn = useRef(null);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch {}
    const show = seen ? null : setTimeout(() => setHint(true), 2600);
    const hide = seen ? null : setTimeout(() => setHint(false), 11000);

    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return () => { clearTimeout(show); clearTimeout(hide); };
    let idleT, raf = 0, last = null;
    function apply() {
      raf = 0; const el = btn.current; if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const dx = last.x - (r.left + r.width / 2), dy = last.y - (r.top + r.height * 0.6);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      el.style.setProperty('--lx', `${(dx / d) * 14 * k}px`);
      el.style.setProperty('--ly', `${(dy / d) * 9 * k}px`);
    }
    function onMove(e) {
      last = { x: e.clientX, y: e.clientY }; setIdle(false);
      if (!raf) raf = requestAnimationFrame(apply);
      clearTimeout(idleT); idleT = setTimeout(() => setIdle(true), 2500);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); clearTimeout(idleT); clearTimeout(show); clearTimeout(hide); if (raf) cancelAnimationFrame(raf); };
  }, []);

  function boop() {
    setHint(false);
    setBooped(true);
    try { localStorage.setItem(HINT_KEY, '1'); } catch {}
    if (ducking) return;
    setDucking(true);
    setTimeout(() => setDucking(false), 1700);
  }

  return (
    <div className="hero-swap hero-in" style={{ '--d': '260ms' }}>
      <button
        ref={btn}
        type="button"
        className={`swap-mole${ducking ? ' is-ducking' : ''}${idle ? ' is-idle' : ''}`}
        onClick={boop}
        aria-label="Boop the Parallax creature"
      >
        <Mole size={170} id="mole-stage" title="Parallax creature" />
      </button>
      {booped ? null : <span className={`mole-hint${hint ? ' is-on' : ''}`} aria-hidden="true">psst… boop me</span>}

      <div className="swap-card">
        <div className="swap-head">
          <span>Crossing</span>
          <span className="swap-pill"><span className="dot dot-in" /> Confidential</span>
        </div>

        <div className="swap-field">
          <span className="swap-label">You send</span>
          <div className="swap-row">
            <strong>0.1</strong>
            <span className="swap-token">
              <ChainIcon chain="sol" size={26} />
              <span>SOL<small>Solana</small></span>
            </span>
          </div>
        </div>

        <div className="swap-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>

        <div className="swap-field">
          <span className="swap-label">You receive</span>
          <div className="swap-row">
            <strong>≈ 0.0042</strong>
            <span className="swap-token">
              <ChainIcon chain="base" size={26} />
              <span>ETH<small>Base</small></span>
            </span>
          </div>
        </div>

        <dl className="swap-meta">
          <div><dt>Arrives in</dt><dd>A fresh wallet</dd></div>
          <div><dt>App fee</dt><dd>0%</dd></div>
          <div><dt>Time</dt><dd>~25 sec</dd></div>
        </dl>

        <Link href="/tunnel" className="btn swap-cta">Start a crossing</Link>
      </div>
      <p className="swap-caption">Example quote. Live prices on the swap page.</p>
    </div>
  );
}
