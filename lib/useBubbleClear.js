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
      b.style.marginLeft = '0px'; b.style.marginTop = '0px';
      const br = b.getBoundingClientRect(), mr = m.getBoundingClientRect();
      if (!mr.width || !br.width) return;
      const w = mr.width, gap = 10, edge = 8, vw = document.documentElement.clientWidth;
      // His visible head and paws in the 400x400 artwork: x 70-330, y 100-310.
      const head = { l: mr.left + w * 0.17, r: mr.left + w * 0.83, t: mr.top + w * 0.24, b: mr.top + w * 0.78 };
      const hits = (x, y) => br.left + x < head.r + gap && br.right + x > head.l - gap && br.top + y < head.b && br.bottom + y > head.t - gap;
      if (!hits(0, 0)) return;
      const cx = (br.left + br.right) / 2, hx = (head.l + head.r) / 2;
      const toRight = head.r + gap - br.left, toLeft = head.l - gap - br.right;
      const tries = cx >= hx ? [toRight, toLeft] : [toLeft, toRight];
      for (const dx of tries) {
        if (br.left + dx >= edge && br.right + dx <= vw - edge) { b.style.marginLeft = `${Math.round(dx)}px`; return; }
      }
      // No room beside him: put it above his head, kept on screen.
      const dy = head.t - gap - br.bottom;
      let dx = 0;
      if (br.left < edge) dx = edge - br.left; else if (br.right > vw - edge) dx = vw - edge - br.right;
      b.style.marginTop = `${Math.round(dy)}px`; b.style.marginLeft = `${Math.round(dx)}px`;
    }
    fit();
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 120); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
