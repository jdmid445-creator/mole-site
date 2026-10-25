const { chromium } = require('/opt/node22/lib/node_modules/playwright');
// Story time segments: [storyStart, storyEnd, speed] where speed < 1 = slower; speed 0 = hold (storyStart==storyEnd, value = seconds).
const PLAN = [
  [0.0, 2.0, 1 / 1.4],   // headline + line draws
  [2.0, 3.5, 1 / 1.3],   // creature cuts the line, "breaks it" comes in
  [3.5, 3.5, 1.1],       // hold on "Parallax breaks it."
  [3.5, 4.1, 1 / 1.3],
  [4.1, 10.4, 1 / 1.33], // the swap on the phone
  [10.4, 10.4, 1.2],     // hold on Arrived
  [10.4, 12.2, 1 / 1.3],
  [12.2, 12.2, 1.6],     // hold on the two views
  [12.2, 15.0, 1 / 1.25],
  [15.0, 15.0, 1.6],     // hold on the end card
];
const segs = []; let T = 0;
for (const [a, b, sp] of PLAN) { const dur = a === b ? sp : (b - a) / sp; segs.push({ T0: T, T1: T + dur, a, b }); T += dur; }
const TOTAL = T;
const warp = (x) => { for (const s of segs) if (x <= s.T1) return s.a === s.b ? s.a : s.a + (x - s.T0) / (s.T1 - s.T0) * (s.b - s.a); return 15; };
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.goto('file://' + __dirname + '/promo-h.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => window.__ready);
  const FPS = 30, N = Math.round(TOTAL * FPS);
  console.log('length', TOTAL.toFixed(2), 's,', N, 'frames');
  for (let f = 0; f < N; f++) { const Tw = f / FPS; await p.evaluate(([t, w]) => window.render(t, w), [warp(Tw), Tw]); await p.screenshot({ path: `sframes/f${String(f).padStart(4, '0')}.png` }); }
  await b.close(); })();
