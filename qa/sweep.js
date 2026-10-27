const { chromium, devices, request } = require('/opt/node22/lib/node_modules/playwright');
const B = 'https://mole-site-mu.vercel.app';
const CA = '6QBFU9GJ5ZU1c27pRhGudqCXLoFchhsahr1Hi8wwpump';
const SOL = 'GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW', EVM = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94', EVM2 = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const BTC = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('PASS', m, extra); } else { fail++; fails.push(m + ' ' + extra); console.log('FAIL', m, extra); } };
const T = async (name, fn) => { try { await fn(); } catch (e) { ok(false, name, 'threw: ' + e.message.split('\n')[0]); } };

(async () => {
  const b0 = await chromium.launch(); const ap = await (await b0.newContext()).newPage(); await ap.goto(B + '/terms', { waitUntil: 'networkidle' });
  const wrap = (r) => ({ ok: () => r.status >= 200 && r.status < 300, status: () => r.status, json: async () => JSON.parse(r.body), text: async () => r.body });
  const call = (method, url, data) => ap.evaluate(async ([m, u, d]) => { const r = await fetch(u, m === 'POST' ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) } : {}); return { status: r.status, body: await r.text() }; }, [method, url, data]).then(wrap);
  const api = { get: (u) => call('GET', u), post: (u, o) => call('POST', u, o.data) };
  // ---------- API ----------
  await T('api', async () => {
    let r = await api.get('/api/health'); ok(r.ok(), 'api/health 200', r.status());
    r = await api.get('/api/network-status'); ok(r.ok(), 'api/network-status 200', JSON.stringify(await r.json()).slice(0, 120));
    r = await api.get('/api/tokens'); const tj = await r.json(); const toks = tj.tokens || tj;
    ok(r.ok() && toks.length > 50, 'api/tokens lists assets', toks.length);
    const chains = new Set(toks.map((t) => t.blockchain)); ok(chains.size >= 13, 'tokens cover 13+ chains', [...chains].join(','));
    const find = (bc, sym) => toks.find((t) => t.blockchain === bc && t.symbol === sym);
    const pairs = [[find('sol', 'SOL'), find('base', 'ETH'), '100000000', SOL, EVM], [find('eth', 'ETH'), find('sol', 'SOL'), '20000000000000000', EVM, SOL],
      [find('btc', 'BTC'), find('arb', 'ETH'), '200000', BTC, EVM], [find('base', 'USDC'), find('sol', 'SOL'), '25000000', EVM, SOL]];
    for (const [a, z, amt, refund, rec] of pairs) {
      if (!a || !z) { ok(false, 'quote pair tokens exist'); continue; }
      const q = await api.post('/api/quote', { data: { dry: true, originAsset: a.assetId, destinationAsset: z.assetId, amount: amt, refundTo: refund, recipient: rec } });
      const qj = await q.json(); const out = qj?.quote?.amountOutFormatted ?? qj?.amountOutFormatted;
      ok(q.ok() && Number(out) > 0, `dry quote ${a.symbol}/${a.blockchain} -> ${z.symbol}/${z.blockchain}`, out || JSON.stringify(qj).slice(0, 160));
    }
    r = await api.post('/api/quote', { data: { originAsset: 'x' } }); ok(r.status() === 400, 'quote rejects missing fields', r.status());
    r = await api.post('/api/quote', { data: { originAsset: 'a', destinationAsset: 'b', amount: '1.5', refundTo: 'x', recipient: 'y' } }); ok(r.status() === 400, 'quote rejects decimal amount', r.status());
    r = await api.get('/api/status?depositAddress=notarealaddress123'); ok(r.status() >= 400 && r.status() < 500, 'status: bad address is a clean 4xx', r.status());
    r = await api.get('/api/solana/blockhash'); const bh = await r.json(); ok(r.ok() && bh.blockhash, 'solana blockhash', bh.blockhash ? 'ok' : JSON.stringify(bh));
    r = await api.get('/api/solana/confirm?signature=' + '1'.repeat(88)); ok(r.status() < 500, 'solana confirm handles bogus sig', r.status());
    r = await api.post('/api/submit', { data: {} }); ok(r.status() === 400, 'submit rejects empty body', r.status());
  });

  const b = await chromium.launch();
  // ---------- pages, links, text, secrets ----------
  await T('pages', async () => {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/favicon|404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const links = new Set(); const scripts = new Set();
    p.on('response', (r) => { if (/\/_next\/static\/.*\.js$/.test(r.url())) scripts.add(r.url()); });
    for (const path of ['/', '/tunnel', '/ghost', '/track', '/docs', '/terms', '/unavailable']) {
      const r = await p.goto(B + path, { waitUntil: 'networkidle' }); ok(r.status() === 200, `page ${path} 200`);
      const html = await p.content(); const text = await p.innerText('body');
      ok(!html.includes(CA), `no CA on ${path}`); ok(!/meme coin/i.test(text), `no "meme coin" on ${path}`);
      ok(/Posted here at launch/.test(await p.innerText('.ca-bar')), `CA bar says posted at launch on ${path}`);
      (await p.$$eval('a[href]', (as) => as.map((a) => a.href))).forEach((h) => links.add(h));
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no sideways scroll ${path}`);
    }
    const r404 = await p.goto(B + '/does-not-exist', { waitUntil: 'networkidle' }); ok(r404.status() === 404 && /doesn.t exist/i.test(await p.innerText('body')), '404 page');
    for (const f of ['/robots.txt', '/sitemap.xml', '/opengraph-image.png', '/twitter-image.png', '/icon.svg', '/favicon.ico']) { const r = await api.get(f); console.log('     ', f, r.status()); }
    const og = await api.get('/opengraph-image.png'); ok(og.ok(), 'OG image'); ok((await api.get('/robots.txt')).ok() && (await api.get('/sitemap.xml')).ok(), 'robots.txt + sitemap.xml');
    ok(errs.length === 0, 'no console/page errors across pages', errs.slice(0, 3).join(' | '));
    // internal links
    const internal = [...links].filter((h) => h.startsWith(B)).map((h) => h.split('#')[0]); const ext = [...links].filter((h) => !h.startsWith(B));
    for (const h of new Set(internal)) { const r = await api.get(h.replace(B, '') || '/'); ok(r.ok(), 'link ' + h.replace(B, ''), r.status()); }
    console.log('      external links:', [...new Set(ext)].join(' '));
    // docs anchors
    await p.goto(B + '/docs', { waitUntil: 'networkidle' });
    const missing = await p.$$eval('.docs-nav a', (as) => as.map((a) => a.getAttribute('href').slice(1)).filter((id) => !document.getElementById(id)));
    ok(missing.length === 0, 'docs nav anchors all exist', missing.join(','));
    // secrets in shipped JS
    let leak = [];
    for (const s of scripts) { const t = await (await api.get(s)).text(); if (/api-key=|helius-rpc\.com\/\?|ONECLICK_|Bearer ey|eyJhbGciOi|PRIVATE_KEY|sk_live/.test(t)) leak.push(s.split('/').pop()); }
    ok(leak.length === 0, `no secrets in ${scripts.size} shipped scripts`, leak.join(','));
    await c.close();
  });

  // ---------- home interactions ----------
  await T('home', async () => {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(B + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2200);
    ok(/is-idle/.test(await p.getAttribute('.swap-mole', 'class')), 'hero creature popped up');
    ok(/Your coins cross\. Your wallet stays yours\./.test(await p.innerText('.hero-bubble')), 'hero opening line');
    await p.waitForTimeout(3000); await p.click('.swap-mole', { force: true }); await p.waitForTimeout(500);
    ok(/is-peek|is-down/.test(await p.getAttribute('.swap-mole', 'class')), 'hero tap -> duck/peek');
    await p.waitForTimeout(400); ok(/is-on/.test(await p.getAttribute('.hero-bubble', 'class')), 'hero tap -> talks');
    // each guard pops when scrolled to
    for (const v of ['toolkit', 'features', 'faq', 'trace', 'closing']) {
      await p.evaluate((v) => { const g = document.querySelector('.guard-' + v); window.scrollBy(0, g.getBoundingClientRect().top - innerHeight * 0.45); }, v);
      await p.waitForTimeout(1900);
      const cls = await p.getAttribute(`.guard-${v} .guard-mole`, 'class'); const bub = await p.getAttribute(`.guard-bubble-${v}`, 'class');
      ok(/is-(idle|rise)/.test(cls) && /is-on/.test(bub), `guard ${v} pops up and talks`);
    }
    // FAQ
    const n = await p.$$eval('.faq details', (d) => d.length); await p.click('.faq details:nth-child(1) summary'); ok(await p.$eval('.faq details:nth-child(1)', (d) => d.open), `FAQ opens (${n} items)`);
    // trace game
    await p.evaluate(() => document.querySelector('#trace').scrollIntoView());
    const before = await p.innerText('.trace'); const deps = await p.$$('.trace button'); ok(deps.length > 8, 'trace game buttons', deps.length);
    await p.click('text=Careful habits'); await p.waitForTimeout(300); ok((await p.innerText('.trace')) !== before, 'trace game switches habits');
    // statement band present, no pac
    ok(!(await p.$('.st-pac')), 'Pac-Man removed');
    // secret dig
    await p.keyboard.type('parallax'); await p.waitForTimeout(600); ok(!!(await p.$('[class*=dig]')), 'typing "parallax" triggers the dig');
    ok(errs.length === 0, 'home has no page errors', errs.join(' | '));
    await c.close();
  });

  // ---------- swap form ----------
  let depositAddr = '';
  await T('swap', async () => {
    const c = await b.newContext({ viewport: { width: 1280, height: 950 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(B + '/tunnel', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const from = p.locator('#pay-from-address'); const to = p.locator('label.field', { hasText: 'receiving into' }).locator('input');
    ok((await from.inputValue()) === '' && (await to.inputValue()) === '', 'address fields start blank');
    const sel = await p.$$eval('select', (s) => s.map((x) => x.value)); console.log('      default pair:', sel.join(' / '));
    await p.fill('input[placeholder="0.0"]', '0.1'); await p.waitForTimeout(3500);
    ok(/~|≈|ETH/.test(await p.innerText('form')) && (await p.$('.quote-wrap')) !== null, 'live price shows without addresses');
    await p.fill('input[placeholder="0.0"]', '0.0005'); await to.fill(EVM); await from.fill(SOL); await p.waitForTimeout(3000);
    ok(/0\.001|minimum|at least/i.test(await p.innerText('form')), 'below-minimum amount is explained');
    await p.fill('input[placeholder="0.0"]', '0.1'); await to.fill('0x9858effD232B4033E47d90003D41EC34EcaEda94'); await p.waitForTimeout(2500);
    await p.check('input[type=checkbox]'); await p.click('.btn-swap'); await p.waitForTimeout(1200);
    ok(/typo/i.test(await p.innerText('.notice-error').catch(() => '')), 'EVM checksum typo caught'); await p.uncheck('input[type=checkbox]');
    await to.fill('not-an-address'); await p.waitForTimeout(2500); ok(/address/i.test(await p.innerText('form')), 'bad destination address caught');
    await to.fill(EVM); await p.waitForTimeout(3000);
    await p.click('.btn-swap'); await p.waitForTimeout(600); ok(/tick|box|understand/i.test(await p.innerText('.notice-error').catch(() => '')), 'swap requires the ack box');
    await p.check('input[type=checkbox]'); await p.waitForTimeout(500);
    ok(/Get deposit address/.test(await p.innerText('.btn-swap')), 'no wallet -> deposit-address mode');
    await p.click('.btn-swap'); await p.waitForSelector('.deposit-item', { timeout: 30000 });
    depositAddr = (await p.innerText('.deposit-item .mono-row')).split('\n')[0].trim();
    ok(depositAddr.length > 30, 'deposit address issued', depositAddr.slice(0, 10) + '…');
    ok(!!(await p.waitForSelector('.qr-box svg', { timeout: 10000 }).catch(() => null)), 'QR code rendered');
    const sendTxt = await p.innerText('.deposit-box'); ok(/send exactly\s*\n?\s*0\.1\d*\s*SOL/i.test(sendTxt.replace(/\s+/g, ' ')), 'send-exactly amount shown at full precision', (sendTxt.match(/exactly[^:]*/i) || [''])[0]);
    ok(/Scan from the send screen/.test(sendTxt + (await p.innerText('.swap-panel'))), 'QR caption');
    const rec = await p.evaluate(() => JSON.parse(localStorage.getItem('parallax-recent') || '[]'));
    ok(rec.length >= 1 && !JSON.stringify(rec).includes(EVM) && !JSON.stringify(rec).includes(SOL), 'saved to My Crossings without wallet addresses');
    await p.click('text=Start over'); await p.waitForTimeout(600); ok(!!(await p.$('.btn-swap')), 'Start over returns to the form');
    ok(errs.length === 0, 'swap page no page errors', errs.join(' | '));
    // split
    await p.click('.split-toggle'); await p.waitForTimeout(300); const ins = await p.$$('.split-addr'); await ins[0].fill(EVM); await ins[1].fill(EVM2);
    await from.fill(SOL); await p.fill('input[placeholder="0.0"]', '0.2'); await p.check('input[type=checkbox]'); await p.waitForTimeout(3000);
    await p.click('.btn-swap'); await p.waitForFunction(() => document.querySelectorAll('.deposit-item').length >= 2, null, { timeout: 40000 });
    ok((await p.$$('.qr-box svg')).length >= 2, 'split: 2 deposit addresses + QRs');
    await c.close();
  });

  // ---------- wallets ----------
  await T('wallets', async () => {
    const c = await b.newContext({ viewport: { width: 1280, height: 950 } });
    await c.addInitScript((SOL) => { const pk = { toString: () => SOL, toBase58: () => SOL };
      window.phantom = { solana: (window.solana = { isPhantom: true, publicKey: pk, connect: async () => ({ publicKey: pk }), on() {}, off() {}, signAndSendTransaction: async () => ({ signature: '5'.repeat(88) }) }) }; }, SOL);
    const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(B + '/tunnel', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    await p.click('.wallet-quick button:has-text("Phantom")'); await p.waitForTimeout(800);
    ok((await p.inputValue('#pay-from-address')) === SOL, 'Phantom fills the sending address');
    ok(/Connected with/.test(await p.innerText('form')), 'connected line shown');
    await p.fill('input[placeholder="0.0"]', '0.1'); await p.locator('label.field', { hasText: 'receiving into' }).locator('input').fill(EVM); await p.check('input[type=checkbox]'); await p.waitForTimeout(2500);
    ok(/Swap privately/.test(await p.innerText('.btn-swap')), 'wallet mode -> "Swap privately"');
    await p.click('text=Disconnect'); await p.waitForTimeout(300); ok((await p.inputValue('#pay-from-address')) === '', 'Disconnect clears the address');
    ok(await p.$$eval('.wallet-quick button', (b) => b.map((x) => x.textContent).join(',')).then((t) => /Solflare/.test(t) && /Backpack/.test(t) && /Axiom/.test(t)), 'Solflare/Backpack/Axiom buttons present');
    ok(errs.length === 0, 'wallet flow no page errors', errs.join(' | '));
    await c.close();
  });

  // ---------- tracking ----------
  await T('track', async () => {
    const c = await b.newContext({ viewport: { width: 1280, height: 950 } }); const p = await c.newPage();
    await p.goto(B + '/track', { waitUntil: 'networkidle' });
    await p.fill('.track-form input', 'definitely-not-an-address'); await p.click('.track-form .btn'); await p.waitForTimeout(2500);
    const m1 = await p.innerText('.track-page'); ok(/not|couldn|check/i.test(m1) && !/Checking…/.test(await p.innerText('.track-form')), 'bad address -> clear message, no stuck "Checking…"');
    if (depositAddr) { await p.fill('.track-form input', depositAddr); await p.click('.track-form .btn'); await p.waitForSelector('.track-message', { timeout: 15000 });
      ok(/waiting|deposit/i.test(await p.innerText('.track-message')), 'real deposit address -> live status', await p.innerText('.track-message')); }
    await c.close();
  });

  // ---------- ghost ----------
  await T('ghost', async () => {
    const c = await b.newContext({ viewport: { width: 1280, height: 950 }, acceptDownloads: true }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(B + '/ghost', { waitUntil: 'networkidle' });
    const RX = { Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, EVM: /^0x[0-9a-fA-F]{40}$/, Bitcoin: /^bc1[0-9a-z]{38,62}$/, Dogecoin: /^D[1-9A-HJ-NP-Za-km-z]{25,34}$/, Litecoin: /^ltc1[0-9a-z]{38,62}$/, XRP: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, Tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/ };
    for (const k of Object.keys(RX)) {
      await p.click(`.ghost-kinds button:has-text("${k}")`); await p.click('.ghost-start .btn'); await p.waitForSelector('.ghost-card', { timeout: 15000 });
      const addr = (await p.innerText('.ghost-row:first-child')).replace('Address', '').trim().split(/\s/)[0];
      ok(RX[k].test(addr), `ghost ${k} address valid`, addr.slice(0, 12) + '…');
      if (k === 'Solana') { const [d] = await Promise.all([p.waitForEvent('download'), p.click('text=Download backup')]); ok(/\.txt$/.test(d.suggestedFilename()), 'backup download', d.suggestedFilename()); }
      ok((await p.$$('.ghost-apps a')).length >= 1, `ghost ${k} "Open it in" links`);
    }
    ok(errs.length === 0, 'ghost no page errors', errs.join(' | '));
    await c.close();
  });

  // ---------- phones ----------
  await T('phones', async () => {
    for (const [n, o] of [['iPhone SE', { ...devices['iPhone SE'], viewport: { width: 320, height: 568 } }], ['iPhone 13', devices['iPhone 13']], ['Pixel 7', devices['Pixel 7']]]) {
      const c = await b.newContext(o); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
      for (const path of ['/', '/tunnel', '/ghost', '/track', '/docs', '/terms']) {
        await p.goto(B + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
        const wide = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        const clipped = await p.evaluate(() => [...document.querySelectorAll('button, a.btn, .field-tag, h1, h2, .swap-token, .pill')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).length);
        ok(wide <= 0 && clipped === 0, `${n} ${path} fits`, wide > 0 ? `+${wide}px` : clipped ? `${clipped} clipped` : '');
      }
      ok(errs.length === 0, `${n} no page errors`, errs.join(' | '));
      await c.close();
    }
  });

  await T('clickable', async () => {
    for (const vw of [1920, 1440, 1280, 1024, 390]) {
      const c = await b.newContext(vw === 390 ? devices['iPhone 13'] : { viewport: { width: vw, height: 900 } }); const p = await c.newPage();
      for (const path of ['/', '/tunnel', '/ghost', '/track', '/docs']) {
        await p.goto(B + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
        // let every creature pop up first
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.6) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 450)); } window.scrollTo(0, 0); });
        await p.waitForTimeout(1200);
        const blocked = await p.evaluate(async () => {
          const out = [];
          for (const el of document.querySelectorAll('a[href], button, input, select, summary')) {
            if (el.closest('.guard-mole, .swap-mole') || el.disabled) continue;
            el.scrollIntoView({ block: 'center' }); await new Promise((r) => requestAnimationFrame(r));
            const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
            const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.opacity === '0') continue;
            const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 6, r.top + r.height / 2], [r.right - 6, r.top + r.height / 2]];
            for (const [x, y] of pts) { if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const hit = document.elementFromPoint(x, y);
              if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) { out.push(`${(el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 24)} <- ${hit.closest('[class]')?.className?.toString().slice(0, 30)}`); break; } }
          }
          return [...new Set(out)];
        });
        ok(blocked.length === 0, `${vw}px ${path} every button/link clickable`, blocked.slice(0, 4).join(' | '));
      }
      await c.close();
    }
  });
  await b.close(); await b0.close();
  console.log(`\n${pass} passed, ${fail} failed`); if (fails.length) console.log('FAILED:\n - ' + fails.join('\n - '));
})();
