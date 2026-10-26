'use client';

import { useEffect, useState } from 'react';
import Mole from './Mole';

// Easter egg: type "parallax" anywhere (not in a text box) and the creature digs across the bottom of the screen.
// The dirt mounds he leaves vanish behind him: no trace.
const CODE = 'parallax';
const RUN_MS = 6400;
const MOUNDS = Array.from({ length: 16 }, (_, i) => 4 + i * 6.1); // left positions in vw

export default function SecretDig() {
  const [run, setRun] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    try { setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch {}
    let typed = '';
    let endT;
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
      const el = document.activeElement;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      typed = (typed + e.key.toLowerCase()).slice(-CODE.length);
      if (typed === CODE) {
        typed = '';
        clearTimeout(endT);
        setRun(Date.now());
        endT = setTimeout(() => setRun(0), RUN_MS);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(endT); };
  }, []);

  if (!run) return null;
  return (
    <div className={`dig${still ? ' is-still' : ''}`} key={run} aria-hidden="true">
      {!still ? MOUNDS.map((x) => (
        <span key={x} className="dig-mound" style={{ left: `${x}vw`, animationDelay: `${(0.25 + (x / 100) * 5).toFixed(2)}s` }} />
      )) : null}
      {!still ? (
        <div className="dig-mole">
          <div className="dig-hop"><Mole size={84} id="mole-dig" title="" /></div>
        </div>
      ) : null}
      <p className="dig-note">Leave no trace.</p>
    </div>
  );
}
