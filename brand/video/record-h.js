const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.goto('file://' + __dirname + '/promo-h.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => window.__ready);
  const FPS = 30, N = 15 * FPS;
  for (let f = 0; f < N; f++) { await p.evaluate((t) => window.render(t), f / FPS); await p.screenshot({ path: `hframes/f${String(f).padStart(4, '0')}.png` }); }
  await b.close(); console.log('frames', N); })();
