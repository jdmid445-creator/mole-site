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
  const [petting, setPetting] = useState(false);
  const [dizzy, setDizzy] = useState(false);
  const boops = useRef([]);
  const stroke = useRef({ x: null, dir: 0, turns: [], t: 0 });

  // Petting: quick back-and-forth strokes over him (3+ direction changes within ~0.9 s).
  function onPet(e) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const st = stroke.current, now = performance.now();
    if (st.x !== null) {
      const dx = e.clientX - st.x;
      if (Math.abs(dx) > 3) {
        const dir = Math.sign(dx);
        if (st.dir && dir !== st.dir) st.turns.push(now);
        st.dir = dir;
      }
    }
    st.x = e.clientX;
    st.turns = st.turns.filter((t) => now - t < 900);
    if (st.turns.length >= 3) {
      if (!petting) { setPetting(true); setHint(false); setBooped(true); try { localStorage.setItem(HINT_KEY, '1'); } catch {} }
      clearTimeout(st.t);
      st.t = setTimeout(() => { setPetting(false); st.turns = []; }, 750);
    }
  }
  function onLeave() { stroke.current.x = null; stroke.current.dir = 0; }
  const btn = useRef(null);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch {}
    const show = seen ? null : setTimeout(() => setHint(true), 2600);
    const hide = seen ? null : setTimeout(() => setHint(false), 11000);

    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) return () => { clearTimeout(show); clearTimeout(hide); };

    // One place moves the eyes (CSS vars, eased by a transition), so following the cursor and
    // glancing around on his own can never fight or snap.
    let idleT, raf = 0, last = null, idleNow = true, glanceT = 0, step = 0;
    const look = (x, y) => { const el = btn.current; if (!el) return; el.style.setProperty('--lx', `${x}px`); el.style.setProperty('--ly', `${y}px`); };
    const GLANCES = [[-12, 3], [12, 2]]; // left, then right; each held ~1.3 s, ~8 s apart
    function glance() {
      if (!idleNow) return;
      const [x, y] = GLANCES[step++ % GLANCES.length];
      look(x, y);
      glanceT = setTimeout(() => { look(0, 0); if (idleNow) glanceT = setTimeout(glance, 7000 + Math.random() * 3000); }, 1300);
    }
    function goIdle() { idleNow = true; setIdle(true); look(0, 0); clearTimeout(glanceT); glanceT = setTimeout(glance, 5000); }
    function apply() {
      raf = 0; const el = btn.current; if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const dx = last.x - (r.left + r.width / 2), dy = last.y - (r.top + r.height * 0.6);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      look((dx / d) * 14 * k, (dy / d) * 9 * k);
    }
    function onMove(e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      last = { x: e.clientX, y: e.clientY };
      if (idleNow) { idleNow = false; setIdle(false); clearTimeout(glanceT); }
      if (!raf) raf = requestAnimationFrame(apply);
      clearTimeout(idleT); idleT = setTimeout(goIdle, 2500);
    }
    function onOut(e) { if (!e.relatedTarget) { clearTimeout(idleT); goIdle(); } } // cursor left the window
    goIdle();
    if (fine) { window.addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('mouseout', onOut); }
    return () => {
      window.removeEventListener('pointermove', onMove); document.removeEventListener('mouseout', onOut);
      clearTimeout(idleT); clearTimeout(glanceT); clearTimeout(show); clearTimeout(hide); if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  function boop() {
    setHint(false);
    setBooped(true);
    try { localStorage.setItem(HINT_KEY, '1'); } catch {}
    // Boop him 10 times in quick succession and he gets dizzy.
    const now = performance.now();
    boops.current = [...boops.current.filter((t) => now - t < 7000), now];
    if (boops.current.length >= 10 && !dizzy) {
      boops.current = [];
      setDucking(false);
      setDizzy(true);
      setTimeout(() => setDizzy(false), 3200);
      return;
    }
    if (ducking || dizzy) return;
    setDucking(true);
    setTimeout(() => setDucking(false), 1700);
  }

  return (
    <div className="hero-swap hero-in" style={{ '--d': '260ms' }}>
      <button
        ref={btn}
        type="button"
        className={`swap-mole${ducking ? ' is-ducking' : ''}${idle ? ' is-idle' : ''}${petting ? ' is-petting' : ''}${dizzy ? ' is-dizzy' : ''}`}
        onClick={boop}
        onPointerMove={onPet}
        onPointerLeave={onLeave}
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
