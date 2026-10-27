const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const CA = '6QBFU9GJ5ZU1c27pRhGudqCXLoFchhsahr1Hi8wwpump'; const B = 'https://mole-site-mu.vercel.app';
(async () => { const b = await chromium.launch(); let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log(c ? 'PASS' : 'FAIL', m); };
  for (const [n, o] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['iphone', devices['iPhone 13']], ['se', { ...devices['iPhone SE'], viewport: { width: 320, height: 568 } }]]) {
    const c = await b.newContext({ ...o, permissions: ['clipboard-read', 'clipboard-write'] }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    for (const path of ['/', '/tunnel', '/ghost', '/track', '/docs', '/terms']) {
      await p.goto(B + path + '?v=' + Date.now(), { waitUntil: 'networkidle' });
      const bar = await p.$eval('.ca-bar', (e) => e.innerHTML);
      ok(bar.includes(CA) && !/Posted here at launch/.test(bar), `${n} ${path}: CA in top bar`);
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${n} ${path}: no sideways scroll`);
    }
    await p.goto(B + '/?v=' + Date.now(), { waitUntil: 'networkidle' });
    const links = await p.$$eval('.ca-bar a', (as) => as.map((a) => a.href)); ok(links.includes('https://pump.fun/coin/' + CA) && links.includes('https://dexscreener.com/solana/' + CA), `${n} bar links pump.fun + DexScreener`);
    if (n === 'desktop') {
      await p.click('.ca-bar button'); await p.waitForTimeout(300); ok((await p.evaluate(() => navigator.clipboard.readText())) === CA, 'bar copy button copies the exact CA');
      const tok = await p.innerText('#token'); ok(tok.includes(CA) && !/Dev wallet/.test(tok) && /live on pump\.fun/.test(tok), '$PARALLAX section: CA, no dev wallet, "live on pump.fun"');
      const tl = await p.$$eval('#token a', (as) => as.map((a) => a.href)); ok(tl.includes('https://pump.fun/coin/' + CA) && tl.includes('https://dexscreener.com/solana/' + CA), '$PARALLAX section chart links');
      await p.click('#token button'); await p.waitForTimeout(300); ok((await p.evaluate(() => navigator.clipboard.readText())) === CA, 'section copy button copies the exact CA');
      await p.evaluate(() => document.querySelector('#token').scrollIntoView({ block: 'center' })); await p.screenshot({ path: 'ca-token.png' });
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300); await p.screenshot({ path: 'ca-top.png', clip: { x: 0, y: 0, width: 1440, height: 140 } });
    } else { await p.screenshot({ path: `ca-top-${n}.png`, clip: { x: 0, y: 0, width: o.viewport.width, height: 120 } }); }
    ok(errs.length === 0, `${n} no page errors`); await c.close();
  }
  const p = await b.newPage(); for (const u of ['https://pump.fun/coin/' + CA, 'https://dexscreener.com/solana/' + CA]) { try { const r = await p.goto(u, { timeout: 25000 }); console.log('     ', u.split('/')[2], r && r.status(), (await p.title()).slice(0, 80)); } catch (e) { console.log('     ', u.split('/')[2], 'could not open from here:', e.message.split('\n')[0]); } }
  console.log(bad ? `${bad} FAILED` : 'ALL PASS'); await b.close(); })();
