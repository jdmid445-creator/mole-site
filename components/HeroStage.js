'use client';

import { useState } from 'react';
import Link from 'next/link';
import Mole from './Mole';
import ChainIcon from './ChainIcon';

// Hero visual: a clean preview of the swap box, with the creature peeking over the top.
// The creature still ducks when clicked.
export default function HeroStage() {
  const [ducking, setDucking] = useState(false);

  function boop() {
    if (ducking) return;
    setDucking(true);
    setTimeout(() => setDucking(false), 1100);
  }

  return (
    <div className="hero-swap hero-in" style={{ '--d': '260ms' }}>
      <button
        type="button"
        className={`swap-mole${ducking ? ' is-ducking' : ''}`}
        onClick={boop}
        aria-label="Boop the Parallax creature"
      >
        <Mole size={170} id="mole-stage" title="Parallax creature" />
      </button>

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
