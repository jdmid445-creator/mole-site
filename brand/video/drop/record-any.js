const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const cfg = require(process.env.SYNC || './sync_points.json'); const spb = 60 / cfg.bpm;
const P = cfg.points.map(([s, b]) => [s, b * spb]);  // [story, video seconds]
const TOTAL = P[P.length - 1][1];
const warp = (T) => { for (let i = 1; i < P.length; i++) { const [s0, t0] = P[i - 1], [s1, t1] = P[i]; if (T <= t1) return t1 === t0 ? s1 : s0 + (T - t0) / (t1 - t0) * (s1 - s0); } return P[P.length - 1][0]; };
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.goto('file://' + __dirname + '/' + (process.env.PAGE || 'promo-3d4.html') + '', { waitUntil: 'networkidle' }); await p.waitForFunction(() => window.__ready);
  const FPS = 30, N = Math.round(TOTAL * FPS); console.log('length', TOTAL.toFixed(2), 's,', N, 'frames');
  for (let f = Number(process.env.FROM || 0); f < Math.min(N, Number(process.env.TO || N)); f++) { const Tw = f / FPS; await p.evaluate(([t, w]) => window.render(t, w), [warp(Tw), Tw]); await p.screenshot({ path: `${process.env.OUT || 'sframes2'}/f${String(f).padStart(4, '0')}.png` }); }
  await b.close(); })();
