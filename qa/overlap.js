const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const LONG = 'I never hold your coins. Just your secret.';
(async () => {
  const b = await chromium.launch();
  const sizes = [['desk', { viewport: { width: 1440, height: 900 } }], ['wide', { viewport: { width: 1920, height: 1080 } }], ['mid', { viewport: { width: 1200, height: 800 } }], ['lap', { viewport: { width: 1024, height: 768 } }], ['tab', { viewport: { width: 800, height: 1000 } }], ['l1400', { viewport: { width: 1400, height: 900 } }], ['l1300', { viewport: { width: 1300, height: 850 } }], ['l1100', { viewport: { width: 1100, height: 800 } }], ['l960', { viewport: { width: 960, height: 800 } }], ['iph', devices['iPhone 13']], ['se', { ...devices['iPhone SE'], viewport: { width: 320, height: 568 } }]];
  let fails = 0;
  for (const [name, opts] of sizes) {
    for (const pg of ['', 'tunnel', 'ghost', 'track', 'docs']) {
      const p = await (await b.newContext(opts)).newPage();
      await p.goto(`https://mole-site-mu.vercel.app/${pg}?v=` + Date.now(), { waitUntil: 'networkidle' });
      const res = await p.evaluate(async (LONG) => {
        const out = [];
        const pairs = [...document.querySelectorAll('.guard-mole, .swap-mole')].map((m) => {
          const bub = m.classList.contains('swap-mole') ? document.querySelector('.hero-bubble') : m.parentElement.previousElementSibling;
          return [m, bub];
        });
        for (const [m, bub] of pairs) {
          m.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 60));
          for (const txt of [LONG, bub.textContent || LONG]) {
            bub.textContent = txt; window.dispatchEvent(new Event('resize')); await new Promise((r) => setTimeout(r, 200));
            const br = bub.getBoundingClientRect(), mr = m.getBoundingClientRect(), w = mr.width;
            const head = { l: mr.left + w * 0.17, r: mr.left + w * 0.83, t: mr.top + w * 0.24, b: mr.top + w * 0.78 };
            const hit = br.left < head.r && br.right > head.l && br.top < head.b && br.bottom > head.t;
            let off = br.left < 0 || br.right > document.documentElement.clientWidth;
            for (let el = bub.parentElement; el && el !== document.body; el = el.parentElement) { const cs = getComputedStyle(el); if (/(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY)) { const r = el.getBoundingClientRect(); if (br.top < r.top || br.left < r.left || br.right > r.right || br.bottom > r.bottom) off = true; } }
            // paws vs the box he hides behind (next sibling of his wrapper)
            let paws = '';
            const wrap = m.parentElement; let box = wrap.classList.contains('guard') ? wrap.nextElementSibling : document.querySelector('.swap-card');
            if (wrap.classList.contains('guard-closing')) box = wrap.parentElement;
            if (box && !wrap.classList.contains('guard-docs')) { const xr = box.getBoundingClientRect(); const pl = mr.left + w * 0.2, pr = mr.left + w * 0.8; if (pl < xr.left + 14 || pr > xr.right - 14) paws = `paws out (${Math.round(pl - xr.left)}, ${Math.round(xr.right - pr)})`; }
            const id = (wrap.className || m.className).toString().replace(/\s+/g, '.');
            if (hit || off || paws) out.push(`${id} "${txt.slice(0, 18)}" ${hit ? 'OVERLAP ' : ''}${off ? 'OFFSCREEN ' : ''}${paws}`);
          }
        }
        return [pairs.length, out];
      }, LONG);
      if (res[1].length) { fails += res[1].length; console.log(name, pg || 'home', res[1].join(' | ')); }
      else console.log(name, pg || 'home', 'ok', res[0]);
    }
  }
  console.log('fails', fails);
  await b.close();
})();
