'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const OBSTACLES = 'h1, h2, h3, p, a, button, input, summary, .btn, .lede, .swap-card, .panel-head';

// Keeps a speech bubble from ever covering the creature (or landing on nearby text and buttons).
// The CSS gives each bubble its spot; if that spot touches him, this tries, in order of how little
// it moves: sliding it left or right, lifting it above his head, or wrapping it to two lines beside
// him, and picks the first that is on screen and clear of him and of the page's words.
export default function useBubbleClear(bubbleRef, moleRef, deps = []) {
  useIso(() => {
    function fit() {
      const b = bubbleRef.current, m = moleRef.current;
      if (!b || !m) return;
      b.style.transform = ''; b.style.whiteSpace = ''; b.style.width = '';
      const mr = m.getBoundingClientRect();
      if (!mr.width) return;
      const w = mr.width, gap = 12, edge = 8;
      // Bounds: the screen, narrowed by any box around the bubble that cuts off what pokes out of it.
      const box = { l: 0, r: document.documentElement.clientWidth, t: -Infinity, b: Infinity };
      for (let el = b.parentElement; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el);
        if (/(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY)) {
          const r = el.getBoundingClientRect();
          box.l = Math.max(box.l, r.left); box.r = Math.min(box.r, r.right); box.t = Math.max(box.t, r.top); box.b = Math.min(box.b, r.bottom);
        }
      }
      // His visible head and paws in the 400x400 artwork: x 70-330, y 100-310.
      const head = { l: mr.left + w * 0.17, r: mr.left + w * 0.83, t: mr.top + w * 0.24, b: mr.top + w * 0.78 };
      const near = [...document.querySelectorAll(OBSTACLES)].map((el) => {
        if (el.contains(b) || el.contains(m) || b.contains(el) || m.contains(el)) return null;
        const r = el.getBoundingClientRect();
        if (!r.width || r.bottom < mr.top - 300 || r.top > mr.bottom + 200) return null;
        return r;
      }).filter(Boolean);
      const meet = (a, r, pad = 0) => a.l < r.right + pad && a.r > r.left - pad && a.t < r.bottom + pad && a.b > r.top - pad;
      function score(br, dx, dy) {
        const a = { l: br.left + dx, r: br.right + dx, t: br.top + dy, b: br.bottom + dy };
        let s = Math.hypot(dx, dy);
        if (a.l < head.r + gap && a.r > head.l - gap && a.t < head.b && a.b > head.t - 7) s += 100000;
        if (a.l < box.l + edge || a.r > box.r - edge || a.t < box.t + edge || a.b > box.b - edge) s += 50000;
        near.forEach((r) => { if (meet(a, r, 4)) s += 5000; });
        return s;
      }
      const br = b.getBoundingClientRect();
      let x0 = 0;
      if (br.left < box.l + edge) x0 = box.l + edge - br.left; else if (br.right > box.r - edge) x0 = box.r - edge - br.right;
      const cands = [
        [x0, 0], [head.r + gap - br.left, 0], [head.l - gap - br.right, 0], [x0, head.t - gap - br.bottom],
      ].map(([dx, dy]) => ({ dx, dy, s: score(br, dx, dy), wrap: 0 }));
      let best = cands.sort((a, z) => a.s - z.s)[0];
      if (best.s >= 5000) {
        // Wrap to two lines on whichever side of him has room, bottom kept level with his head top area.
        for (const side of ['left', 'right']) {
          const room = side === 'left' ? head.l - gap - box.l - edge : box.r - edge - head.r - gap;
          if (room < 140) continue;
          b.style.whiteSpace = 'normal'; b.style.width = `${Math.min(room, Math.max(190, br.width * 0.6 + 30))}px`;
          const r2 = b.getBoundingClientRect();
          const dx = side === 'left' ? head.l - gap - r2.right : head.r + gap - r2.left;
          const dy = br.bottom - r2.bottom;
          const s = score(r2, dx, dy) + 40;
          if (s < best.s) best = { dx, dy, s, wrap: b.style.width };
          b.style.whiteSpace = ''; b.style.width = '';
        }
      }
      if (best.wrap) { b.style.whiteSpace = 'normal'; b.style.width = best.wrap; }
      if (best.dx || best.dy) b.style.transform = `translate(${Math.round(best.dx)}px, ${Math.round(best.dy)}px)`;
    }
    fit();
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 120); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
