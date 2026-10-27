'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Keeps a speech bubble from ever covering the creature. The CSS gives each bubble its spot;
// this measures the bubble against his head and, if they touch, slides the bubble sideways
// (away from him) or, when there's no room on screen, lifts it above his head.
export default function useBubbleClear(bubbleRef, moleRef, deps = []) {
  useIso(() => {
    function fit() {
      const b = bubbleRef.current, m = moleRef.current;
      if (!b || !m) return;
      b.style.transform = '';
      const br = b.getBoundingClientRect(), mr = m.getBoundingClientRect();
      if (!mr.width || !br.width) return;
      const w = mr.width, gap = 12, edge = 8, vw = document.documentElement.clientWidth;
      // His visible head and paws in the 400x400 artwork: x 70-330, y 100-310.
      const head = { l: mr.left + w * 0.17, r: mr.left + w * 0.83, t: mr.top + w * 0.24, b: mr.top + w * 0.78 };
      // First keep it on screen.
      let x0 = 0;
      if (br.left < edge) x0 = edge - br.left; else if (br.right > vw - edge) x0 = vw - edge - br.right;
      const clear = (x, y) => br.left + x >= head.r + gap || br.right + x <= head.l - gap || br.bottom + y <= head.t - gap || br.top + y >= head.b;
      if (clear(x0, 0)) { b.style.transform = x0 ? `translate(${Math.round(x0)}px, 0px)` : ''; return; }
      const onScreen = (x) => br.left + x >= edge && br.right + x <= vw - edge;
      const moves = [
        [head.r + gap - br.left, 0],   // slide right
        [head.l - gap - br.right, 0],  // slide left
        [x0, head.t - gap - br.bottom], // lift above his head
      ].filter(([x]) => onScreen(x)).sort((a, z) => Math.hypot(...a) - Math.hypot(...z));
      let [dx, dy] = moves[0] || [0, head.t - gap - br.bottom];
      if (!moves.length) { if (br.left < edge) dx = edge - br.left; else if (br.right > vw - edge) dx = vw - edge - br.right; }
      b.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
    }
    fit();
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 120); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
