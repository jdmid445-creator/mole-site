# PROJECT.md

Living notes for this project. Claude keeps it current; the owner corrects it in chat.
Last updated: 2026-10-24.

## Goal (one sentence)

A website where you move crypto from one chain to another (e.g. SOL → ETH on Base) without a public
link between the wallet you send from and the wallet you receive in — with a meme coin launched
alongside it. **Product first, coin second.**

## Audience

Solana meme traders / degens who don't want their wallets tracked.
They should: land, get it in ~5 seconds, try Parallax, feel "this is legit, not another rug", then buy the coin.

## Done this week (draft — owner to confirm)

1. ~~Name locked.~~ ✅ **Parallax / $PARALLAX** (2026-10-24)
2. Site renamed, on a clean custom domain, live.
3. One successful real test swap (small amounts, secondary wallet → fresh wallet).
4. Final logo + banner in the chosen name.
5. Launch on pump.fun; contract address + dev wallet shown on the site.

## What exists

| Thing | Where | Status |
|---|---|---|
| Code | GitHub `jdmid445-creator/mole-site` (branch `main`) | Next.js 14, JS, auto-deploys to Vercel on push |
| Live site | https://www.parallaxswap.com (bare parallaxswap.com redirects to www) | Custom domain added 2026-10-25. Old https://mole-site-mu.vercel.app still works |
| Hosting | Vercel project `mole-site` (team YOSH) | Env vars set: `HELIUS_API_KEY`, `NEAR_INTENTS_JWT` (all envs) |
| Swap rails | NEAR Intents 1Click API, `confidentiality: advanced` | Partner account "MOLE", Distribution Channel key |
| Logo | Design canvas "$MOLE Logo" → artboard **"★ Night, peeking out"** | Final mascot: deep-violet creature peeking out of a dark hole, lime eyes, pink nose, soft glow, on #0C0A18 |
| X | https://x.com/parallaxswap (display name Parallax, PFP = Night creature) | Header banner: brand/parallax-x-header.png (source brand/x-header.html) |
| Domain / Telegram | — | None yet. Aim to match handle: parallaxswap |
| Token | — | Not launched. Launching on pump.fun (Solana) |

## Name

**Parallax** (product) · **$PARALLAX** (token, pump.fun).
Story: watchers on one chain see something unrelated to what arrives on the other, the same thing looks different depending on where you stand.
Conflict check 2026-10-24: only small unrelated projects use the name: Parallax (LAX) PoW chain ~$45K mcap; Parallax (PLX) dormant Arbitrum LSDfi; Parallax Network (2019 software). None in Solana/privacy. Tickers LAX and PLX taken, so use **$PARALLAX**.
Mascot (Night creature in its hole) stays.

## Product: Parallax (swap app at /tunnel)

- Non-custodial front-end for NEAR Intents 1Click swaps with confidential mode on. Site never holds funds or keys.
- Chains at launch: Solana, Ethereum, Base, Arbitrum, BNB (one-click via browser wallet), Bitcoin (deposit mode).
- Zero app fee (owner doesn't want to earn from the tech; money comes from the coin).
- Honest framing: hides the *link* between wallets; deposit and arrival are still public. "Private, not invisible."
- Verified 2026-10-24: `/api/health` shows both keys; Preview quote 0.1 SOL → ~0.00432 ETH on Base, ~24s, confidential mode accepted. **Real end-to-end swap verified 2026-10-25 (SOL→Base ETH from Axiom).**

## Stack

Next.js 14 (App Router, plain JS), @solana/web3.js, injected EVM wallets (no WalletConnect yet), server API routes
proxy NEAR (`/api/tokens`, `/api/quote`, `/api/status`, `/api/submit`, `/api/solana/blockhash`, `/api/health`).
Fonts: **Manrope** (was Sora, then Bricolage Grotesque) + JetBrains Mono for addresses. Palette: bg #0C0A18, violet #5A41D6/#7B62F0, lime #C8FF2E, pink #FF8FB8.

## Design (v2, 2026-10-24)

References from owner: blackout.exchange, vanish.trade/us, veilit.xyz, web-4.app.
- Veil + Web4 read fully; Blackout + Vanish render client-side, so only titles/colors were readable (Blackout bg #0b0b0f, tagline "trade perps nobody can see"). Ask owner for screenshots if we need to match them more closely.
- Shared traits taken: near-black base, very short headlines, numbered steps, hidden-vs-public explanation, stats with real numbers, FAQ, closing CTA.
- Deliberately skipped: scrolling ticker, ALL-CAPS labels, arrows on buttons, identical card grids.
- Signature element: **parallax hero**, two tilted chain planes (Solana behind, Base in front) drifting with the pointer at different depths, creature between. Static on touch devices and with reduced motion.
- Story section "Two views, no line": what Solana sees vs what Base sees.
- Type: **Manrope** for everything (owner: "also change the font"); JetBrains Mono only for addresses.
- Copy: hero "Seen from one chain, it left. Seen from the other, it arrived." Primary action everywhere is "Make a crossing".
- Real numbers only: 1 signature, 0 funds held, 0% app fee, 6 chains, ~24s from our test quote.

## Pages and features (as of 2026-10-24)

- `/` home: parallax hero, live network status, chain band, steps timeline, "Two views, no line", "Keeping it clean" + Built on (NEAR Intents, Helius, Solana, as text, not logos), stats, FAQ, token, closing CTA.
- `/tunnel` swap app (titled "Make a crossing"), live status, link to track a crossing.
- `/track` check any crossing by deposit address (`?d=` prefills).
- `/docs` full explainer. `/terms`. `/unavailable` (geo-block page).
- Share card: `/opengraph-image` + `/twitter-image` (creature + headline).
- `/api/network-status`: live from NEAR (2026-10-24: 88 assets on our 6 chains, 37 chains on the network).
- Geo-blocking middleware on the swap flow: CU, IR, KP, SY + Crimea/Sevastopol/Donetsk/Luhansk. **Not legal advice; list should be reviewed.**
- Claude can now screenshot the live site itself (owner allowed `mole-site-mu.vercel.app` in network egress). Script: Playwright, desktop 1440 and phone 390.
- Header spans full window width (logo far left, menu far right, ~38–48px edge margin); content below stays in the centered column.
- Page clips horizontal overflow (html, body overflow-x: clip) so slide-in animations can't widen phones. Check phone width with scrollWidth == innerWidth at load, before scrolling.
- Coin/chain logos: official network icons from Web3 Icons (MIT) in /public/chains (sol, eth, base, arb, bsc, btc) + LICENSE.txt. Used in chain row, hero panels, swap circles, trace game.
- **Rule: never show logos or "backed by" claims for firms that haven't actually backed or partnered with us.**
- Interactive: hero creature eyes follow the cursor; clicking it ducks it into the hole (boop counter). "Try to trace it" game on home (careless vs careful habits; demo data, rate from real quote).
- Layout (updated): fluid root font size (16px base; 17.5px ≥1600, 19px ≥1900, 21px ≥2300) so the whole site scales up on wide screens; container 80rem, 88rem ≥1600. CORRECTION: owner was zoomed out. Real Chrome viewport at normal zoom ≈ **1470×745** (MacBook Air, short screen). Always check at 1470×745 first, then 2000 and 390. Hero sizes from window height so it fits in one screen. Earlier note: container 1280px; hero fills first screen on desktop with a drifting perspective grid; headline capped so it stays 3 lines (checked at 1990, 1440, 390 widths).

## Decisions and why

- **No mixer / no custody.** Holding and forwarding user funds = unlicensed money transmission risk (Tornado Cash, Samourai cases). Use NEAR's network instead.
- **No Veil.** Owner wants no dependency on Veil; used only as an example.
- **NEAR Intents over Houdini** to start: self-serve, live, confidential mode; Houdini needs partner approval.
- **pump.fun launch** → standard token, so privacy lives in the website tool, not the token.
- **Single-wallet launch, public dev wallet.** Will not help with Proxima-style bundling across wallets or volume bots (misleads buyers).
- **Night creature mascot** chosen after many rounds (see feedback log).

## Owner preferences (rules)

- Product first, coin second. Think like a company.
- Names: real words preferred; tied to what the tech does; must fit the creature-in-a-hole logo; **no "coin" in the name**; not too long ("switchback, getaway… too long"); not too plain/simple either.
- Look: sleek, works for a website; liked lo-fi doodle refs for meme coins but chose the soft/night character.
- Doesn't want to make money from the tech; zero fees.
- Writes short and casual — infer from context.
- **No native/default browser styling on controls** ("there should be no silver on the boxes"). Every select, checkbox and input gets custom dark styling.
- **Fonts must be clearly premium and actually load** ("make the fonts way better"). Root cause found: a :root `--font-sans` fallback overrode next/font's variable, so the system font showed. Never redeclare next/font CSS variables in :root.
- **Banners/marketing art: no creature ("logo guy")** — sleek and professional, like a funded product.
- **Wants rich, polished animation** like the reference sites ("make some animations… make it animated and look amazing"). This overrides the default "one motion moment" restraint. Always keep reduced-motion support.

## Open questions

- ~~Name~~ decided: Parallax. History: rejected $ZERO (initially liked), $MOLE (initially "fw mole", later wanted change), $TUNNEL ("tunnel sucks"), and long lists of others.
  Last shortlist offered: Enclave, Lowkey, Backchannel, Courier, Undercurrent, Proxy; then Lowroad, Quietlane, Soto, Underlink.
- Domain (wait for the name).
- X / Telegram handles.

## Feedback log (owner's exact words)

- "nah we need something more professional"
- "i dont want to make money off the tech haha, just off the meme coin"
- "i want veil to have nothing to do with this"
- "i fw mole, generate me some logos"
- "something sleeker for a website like this i think"
- "love last one and the 3rd to last" → Night palette + peeking-out pose
- "beauty i love it. the last one is perfect now" → Night, peeking out (sized 540/640, faint hole rim)
- "nah lil smaller" (after making it bigger)
- "yk what, i think we need a name change"
- "nvm tunell sucks"
- "they dont seem very related to the tech"
- "seal is so fire if our logo had a seal in it but it doesnt"
- "switchback, getaway, all those are too long and shit"
- "no coin in it"
- "think like a company"
- "don't give names with coin in it, we are a product first, coin second"
- "nah i dont like any of those, try again make them higher quality" → rejected Bolthole, Sett, Nether, Hideout, Molehill, Undernet, Grotto, Trapdoor (plain descriptive nouns read as low quality)
- "base it off some pumpfun coins that have ran" → offered Vein, Prowl, Guise, zkMole, Delve, Dive
- "remember think like a company. this is a product" → rule: name must sound like a funded startup/product first; meme formulas only as inspiration, never the main driver
- Offered Liminal, Aperture, Parallax, Interstice, Lattice, Meridian → "parallax isnt bad keep trying tho these are getting closer youre onthe right track"
  → what's working: one smart, abstract concept word (physics/optics/perception) with a real story tied to "watchers can't connect the two sides"
- Offered Refract, Blindspot, Oblique, Occlude, Decohere, Tangent, Lensing, Vanishing Point → "getting closer keep going"
- Offered Neutrino, Axion, Antumbra, Nadir, Transit, Entropy, Darkmatter → "i lowkey like vanish"
  → CONFLICT found: **Vanish** (vanish.trade) is an existing Solana privacy trading layer, $1M pre-seed led by Colosseum with Solana Ventures (Aug 2025). Same niche → confusion/knockoff look. Recommended a variant with the same feeling instead.
  → what's working: the feeling of disappearing; short, clean, one word
- Offered Evanesce, Vamoose, Dissolve, Unsee, Exeunt, Afterimage → "eh those arent so good keep going tho, vanish and parralax are good"
  → favorites so far: **Vanish** (taken) and **Parallax**. Shared traits: 2–3 syllables, sharp consonants (V / X), real word, sounds cool said out loud, about disappearing or perception
- "yk what why dont we go with parralax" → **decision: Parallax.** Site renamed same day.
- "okay it works on my phone its all good, im gonna buy the domain after but lets make this tech a little better, im gonna input some websites i like and their designs, make my website similar ideas to theirs" → next: study owner's reference sites closely (fonts, spacing, motion, tone, structure) and redesign to match. Domain purchase comes after.
- "just change up the website make it super nice and well go from there on things i want to change" → shipped design v2 (see Design section). Vercel build passed. Not yet visually checked by Claude (no browser available in session); asked owner for phone screenshots.
- "okay first off this looks like shit make the fonts way better and there should be no silver on the boxes. also make some animations…" (screenshot of /tunnel) → fixed font bug, custom selects/checkbox, legend wrapping, gradient card, full animation pass. Vercel build passed. Still not visually checked by Claude (no browser connected).
- "what can we add that will make it look more legitimate? more professional like maybe how vanish has this?" (Vanish backers + integrity framework screenshots) → explained we can't show backers we don't have; built honest equivalents.
- "add some stuff you think will look good. ill give you the x and shit later" → shipped share card, live status, chain band, Keeping it clean, geo-blocking, Track, Docs. Verified with screenshots on desktop + phone. Pending from owner: X/Telegram links, domain, decision on open-sourcing repo.
- "fix this, see how on chrome it doesnt look filled out. lets also add something that has some type of like interactoin that the user can play with" → widened layout + full-screen hero + earlier scroll reveals; added creature boop + "Try to trace it" game. Played the game in a real browser (careless 5/5, careful 1/5); checked 3 screen sizes.
- "it still looks like this on google chrome" (2000px-wide window, content looked like a narrow column with dead space) → made the site scale up on wide screens, removed the forced full-height hero, full-width background glow. Checked at 2000, 1470 and 2560 widths.
- "oh i was zoomed out before. this is normal screen. fix it now" + "also change the font" + "use photos of currency too" → hero fits window height at 1470×745, font → Manrope, real coin logos added. Checked at 1470×745, 1512×860, 2000×1010, 390 and 360 phones.
- "shouldnt parallax on the top left be more on the left, and the icons up right more to the right?" → header now full-width. While checking found + fixed: phones were 20px too wide at load (pre-reveal slide-in), creature overlapping Base label on phones, hint placement.
- "what should my X name be?" → suggested handles (see reply).
- "make me a back banner" (X profile @parallaxswap) → 1500×500 X header in site style, kept clear of avatar overlap and mobile crop. Saved in brand/.
- "how about a bio, and lets link my twitter on the website now somewhere" → X icon button in header (laptop + phone) and "X (@parallaxswap)" in footer; default in lib/site.js. Bio options given in chat.
- "make the twitter background better, i dont like it" → 3 new X header directions (A Depth: floating coins + creature; B Bold: big wordmark + SOL/Base coins; C Big creature + "No line between your wallets."). Files in brand/. Waiting on owner pick.
- "should we add a tab to the site to make a new ghost wallet for any crypto not connected to their own??" → /ghost page + "Ghost wallet" in header/footer + "Create a ghost wallet here" under the swap destination. Solana (private key) and EVM (12-word phrase, one address for ETH/Base/Arbitrum/BNB). Made in the browser, never sent anywhere. Checked: no network requests carry keys; Solana key matches address; EVM phrase gives the same address in MetaMask's default path. Bitcoin later.
- "also put the try to trace it game at the bottom, it doesnt need to be that high up" → moved to just above the closing "Ready to cross?".
- "try again for the twitter backgrounds btw, those ones r bad, i dont want our logo guy in it i want it to be sleek and professional" → rule: no creature in banners/marketing art; sleek, professional.
- "can you add more than just eth and sol for the ghost wallets? add a few more big coins" → ghost wallets for Bitcoin, Dogecoin, Litecoin, XRP and Tron (12-word phrase, standard paths: BTC/LTC Native SegWit, so they import into Trust Wallet/Exodus/Ledger). Also added those 5 chains plus Avalanche, Optimism and Polygon to crossings, 13 chains in total. Checked: derivation matches public reference vectors; on the live site every type's phrase and backup key gives the address shown; no keys sent; dry-run quote 0.1 SOL → ~7.76 XRP to a ghost XRP wallet worked. Logos from Web3 Icons (MIT), pulled via GitHub.
- "so does all the tech work? i chose C for the banner. lets test the tech" → Banner C is final (brand/parallax-x-header-FINAL.png). Test run 2026-10-25: 26/28 dry-run quotes OK across all 13 chains, all in confidential mode; even $1 SOL→Base quotes. Network-side temporary minimums: BNB Chain $1,000, sending from Tron $100 (site shows the network's message). Real quote issued a deposit address; /api/status + Track page show "Waiting for deposit". Not yet done: a real swap with real funds (owner's wallet; needs owner to sign).
- (Discord link preview screenshot) "i dont like the font on this screen when it shows as a pop up, change that font to make it more clean… take a look at https://houdiniswap.com/ … the embed should be more simple and less Vibecodey and to match the font of the new updated website" + "wait no it should have the creature" → share card is now a static 1200×630 PNG rendered in Manrope: creature + "Parallax" lockup, one line "Private cross-chain swaps". Old card fell back to a default font (it never loaded Manrope). Preview text: "Parallax — Private cross-chain swaps" / "Swap across 13 chains with no public link between your wallets. Non-custodial. Zero fees." Rule: the creature stays in the share card (only the X banner is creature-free).
- "yeah js take a look at houdiniswap and make the website a litrle cleaner based on their design" (owner allowlisted houdiniswap.com so I could screenshot it) → Home rebuilt on Houdini's pattern: framed hero panel (headline + swap-box preview with creature peeking over it, chain logos, stats bar inside), "The privacy toolkit" product panel (Private crossing / Ghost wallets / Track), gradient statement band, 8-item features grid, centered boxed FAQ, footer with logo + "Follow us on X" pill and columns. Type is now Manrope 500 (not 800) — lighter and cleaner. Removed: tilted 3D planes, grid floor, "click me", Two views section (now a FAQ answer). Header button → "Launch app". Checked 1470×745, 390, 360 (no overflow, no errors).
- Rule: clean, Houdini-like — light headline weight, framed panels, minimal effects. Keep the creature on site and share card.
- (screenshot of the statement band) "i dont really like this design for this, feel like it should be animated or something. mess around with it try somethign else, everything else looks nice" → band now uses the X banner's light bars, waving slowly (violet→lime), and the sentence lights up word by word as you scroll. Static for reduced-motion. Checked 1470×745 and 390.
- "okay i love the back animation, but honestly i think the text shouldnt have an animation" → removed the word-by-word scroll effect; text is static, bars keep waving. Rule: keep text still; motion belongs in backgrounds.
- "maybe have it do one animation wherr the opacity starts a little lower the gets brighter? something simple and sleek" → statement text now fades from 30% to full brightness (with a slight rise and unblur) once as it enters view, ~1.4s. No per-word effects.
- "i already bought it" → parallaxswap.com connected in Vercel (Add Existing; apex 308-redirects to www.parallaxswap.com, which serves Production). mole-site-mu.vercel.app kept working alongside. Link previews now point at https://www.parallaxswap.com.
- "open in phantom button is a great idea, add that for sure, and split send could be super cool lets mess with that too add it into the make a crossing tab" → Swap page: "One wallet / Split across wallets" toggle. Split = 2–5 rows (address, %, Ghost button per row, remove), Even split / Shuffle amounts, total check; one quote + deposit address per part; Solana sends ONE transaction paying all deposit addresses (one signature), EVM approves each part; deposit mode lists each address + amount; per-part status + track links. Phones without an injected wallet get "Open in Phantom/Solflare" (Solana) or "MetaMask/Coinbase/Phantom" (EVM) deep links. Tested with a recording stand-in wallet (no funds): 3-way split of 0.3 SOL → 1 transaction, 3 transfers, each to its own deposit address, totals exact; phone links correct; no overflow at 375/390. Docs section added.
- "so on computer will it not pop up to launch phantom or solfare?" → explained it does (extension popup). Then "yeah fix it if you think thats best" → wallet picker: Connect lists the wallets actually installed (Phantom/Solflare/Backpack; EVM via EIP-6963 so MetaMask/Rabby/Coinbase each show), one wallet = connects straight away, none = install links. "Switch" next to the connected address. Wallet logos from Web3 Icons (MIT) in public/wallets.
- "yes def tweak those things, but maybe fill in solana with whichever wallet they are using, so if they are using eth for example itll say 'connect etherium wallet'" → Connect button now reads "Connect {chain} wallet" (Solana, Ethereum, Base, Arbitrum…), picker says "Choose a {chain} wallet". Sections renamed "From your wallet" / "To your private wallet". Rule: plain, non-techy wording in the app.
- (screenshot: ".05" flagged with "Something like 0.1 is harder to match") "we should probably fix this" → round = at most 2 significant digits (0.05, 0.25, 1.5, 150 no tip); suggestion is the same amount rounded to 2 significant digits (1.237 → 1.2), never a different size; tip is lilac, not error-pink. Owner is testing on parallaxswap.com (domain live).
- "i feel like this is to complicated for the user, it should be with the click of that button the funds swap, shouldnt have to connect anything unless they want to" → One-button swap: no Connect step and no Preview button. Price appears automatically as you type (dry quote, 650 ms after typing stops). "Swap privately" opens the wallet popup (picker only if several wallets), then sends — one approval. "No wallet here? Pay from any wallet or exchange instead" switches to deposit-address mode with a refund address. Explained to owner: approving in the wallet can't be skipped (that's what non-custodial means).
- "we should also prob add axiom too, thats where my wallets are on" → Axiom wallets live inside Axiom (no extension), so sites can't connect to them; supported via send-it-yourself: "Paying from Axiom?" link on the swap form and an "Axiom" row in the wallet picker → deposit address + "In Axiom, tap Withdraw and send exactly X SOL…"; refund field becomes "Your Axiom wallet address". Neutral "A" tile, not Axiom's logo. Also fixed live price placeholders (network rejects the system address and 0x…dEaD; now uses public BIP test-vector addresses).
- 2026-10-25 15:40 — FIRST REAL CROSSING SUCCEEDED. Owner sent 0.05 SOL from Axiom (Withdraw, send-it-yourself mode) to deposit HCNASmBdgLELVcvn81NMfhzDFiLwByg1SRTgSBPc4wbd → 0.002156958904590236 ETH on Base, confidential mode. Solana tx MKcvuePvShq3MUNF9kqPRvQVkVxsrpgKrQZWB2rFMmkh9GBgcY6ysAfuy61bprniEECoWYZG6kMh9KNxUmmFhy6, Base tx 0x748fabd2b50e6b3af66ceb0cf43452224cbf8d15919c25d24dcf13516f5fa9b3. Quoted ~0.0021554 ETH, got 0.0021570. (An earlier deposit address 31nZ… from the same session was abandoned, never funded.)
- "just chef me up a lil animated video for my twitter... clean, sleek... u can use a real phone in it maybe doing a swap... like 15s long" → brand/video/parallax-promo.mp4 (15s, 1080×1080, 30fps, no audio, ~0.9 MB). Scenes: "Every swap leaves a trail." (public line between wallets) → "Parallax breaks it." (line snaps) → phone doing a real swap with the real test numbers (0.05 SOL → 0.002157 ETH on Base, steps 1-2-3) → "Two chains. No line between them." (What Solana sees / What Base sees) → creature + Parallax + parallaxswap.com. Source: brand/video/promo.html (deterministic render(t)), record.js → frames → ffmpeg.
- "i think it would be fun if we had our mascot/logo in it, and make it so it fits the full screen. retry" + "like the mascot or logo doing something in the video" → brand/video/parallax-promo-vertical.mp4 (1080×1920, 15s, fills a phone screen). Creature acts: bursts up through the public line between wallets and cuts it → sits on top of the phone watching the swap → dives into its tunnel while coins cross → pops back up happy on "Arrived" → peeks between "What Solana sees / What Base sees" → end card. Rule: creature is welcome in videos/share card; banner stays creature-free.
- "no no fill it out horizontallly. its for twitter" + "i love that video though" → brand/video/parallax-promo-16x9.mp4 (1920×1080, 15s): same mascot story laid out for widescreen (wallets left/right with the creature cutting the line; headline + 1-2-3 steps left, phone right with the creature on top; two views side by side with the creature between; creature + Parallax lockup). Default format for X videos: 16:9 1920×1080.
- "this last one is great, do you think it should be a little bit slower tho so the people can read... if it needs to be longer than 15 s thats okay" → brand/video/parallax-promo-16x9-slow.mp4 (~25 s): whole story ~1.3× slower plus reading pauses on "Parallax breaks it." (1.1 s), Arrived (1.2 s), the two views (1.6 s) and the end card (1.6 s); background bars keep moving during pauses. Re-timing lives in record-h-slow.js (PLAN table). Rule: give text time to be read.
- "lets make ti a little quicker than that, happy medium" → brand/video/parallax-promo-16x9-21s.mp4 (~21 s): ~1.15–1.2× slower than the original, pauses 0.7–1.2 s. Timing in record-h-mid.js.
- "and add some 3d elements" → brand/video/parallax-promo-3d.mp4 (~21 s, 1920×1080, middle-speed timing): spinning 3D coins with thickness (SOL + Base/ETH faces) beside the wallets, flanking the phone (SOL coin shrinks and ETH coin grows as the swap crosses) and around the end card; phone + creature rig swings in and stays angled in 3D with a slow drift; wallet and two-views cards tilt toward the centre. Source: promo-3d.html + record-3d.js.
- "i like everything except the coins at the beginning and the end of the second one, lets also make it a tad bit faster... try adding something else in for some 3d elements" → brand/video/parallax-promo-3d-v2.mp4 (~19 s): coins only around the phone now; wallet + two-views cards are thick 3D slabs (violet edges) tilted toward the centre; end card has an extruded 3D "Parallax" wordmark that swings in. Timing ~1.08× original + short pauses. Source: promo-3d2.html + record-3d2.js.
- (screenshots of blank purple cards at 0:04 and 0:13) "it makes it look choppy fix that... i also dont like the end how you did the parallax in 3d and pop in, go back to the other option... have the two 3d coins just floating... dont have one pop up then the other" → v3 (brand/video/parallax-promo-3d-v3.mp4, ~19 s). Cause: fading a 3D object makes Chrome flatten it, so the thickness layers covered the text. Fix: fade a wrapper, keep the 3D object opaque (cards, coins, phone rig). Coins: both float steadily beside the phone, same size, no pop/shrink. End card: flat lockup again. Rule: no pop-ins, smooth flowing motion; check mid-fade frames.
- "we need an audio now, something simple" → brand/video/parallax-promo-final.mp4 = v3 video + original synthesized soundtrack (brand/video/audio.py → soundtrack.wav; no samples, so no licensing issues). Soft pad (Am9–Fmaj7–Cadd9–G), sub bass, light 100 BPM pulse from the phone scene on, quiet pluck arpeggio, SFX synced to events (line shimmer, creature pop at the cut, low hit on "breaks it", phone whoosh, typing ticks, tap click, tunnel riser, Arrived chime, end shimmer). AAC 192k, −16 LUFS, no clipping.
- "try one more different audio just so i can see some options" → option B: brand/video/parallax-promo-final-lofi.mp4 (audio_lofi.py → soundtrack-lofi.wav): lo-fi chill, electric-piano chords (Am9–Fmaj9–Dm9–E7) at 86 BPM with swung kick/snare/hats from the line cut onward, vinyl crackle; only key SFX kept (creature pops, tap, Arrived chime, end shimmer). Option A = parallax-promo-final.mp4 (ambient pad + pulse + full SFX). Waiting on owner's pick.
- (screenshot: phone touching the bottom) "move the phone up a little bit... i like the 2nd audio more than the first, but lets try a new one one more time" → v4 video: phone + creature moved up and scaled to 94% (≈90 px clear above, ≈80 px below). Audio: owner prefers lo-fi (B) over ambient (A). New option C = smooth chill-trap (audio_trap.py: airy pad intro, drop at the line cut, 140 BPM half-time 808/clap/rolling hats, pluck melody). Files: brand/video/parallax-promo-v4-lofi.mp4 and parallax-promo-v4-trap.mp4. Waiting on pick.
- "i dont like how you added the beats in, take those out its not supposed to be hype lol... make the audio closer to option 2" → option D: brand/video/parallax-promo-v4-calm.mp4 (audio_lofi_nodrums.py): lo-fi with NO drums, 78 BPM e-piano chords (Am9–Fmaj9–Dm9–E7), soft bass, warm pad, slow sparse e-piano melody, vinyl crackle, key SFX only. Rule: calm, not hype; no drum beats in brand audio.
- "i dont like the ice cream truck noise im hearing, change it up a litte" → calm2 (brand/video/parallax-promo-v4-calm2.mp4, audio_calm2.py): melody an octave lower with a mellow sine voice (no FM/tremolo), Arrived bells → warm low swell, end shimmer → low chord bloom, e-piano darker. High (>1.5 kHz) energy cut ~10×. Rule: no high chimes/bells/music-box tones.
- "i like it btw thats good, thats the finished product for sure im gonna go upload it" → FINAL promo = brand/video/parallax-promo-v4-calm2.mp4 (1920×1080, ~19 s, calm lo-fi no drums, no chimes). Captions offered (3 options, no emojis).
- (sent Veil's promo video as audio reference) "do you see how the music flows with the effects and whats happening on screen? i want mine to be the same" → analysed it: deep soft bass pulses on a steady grid with every caption/UI change landing on a pulse, low warm drone, very few highs. Scored ours to the picture (original, audio_sync.py → brand/video/parallax-promo-v4-scored.mp4): pulse on every key moment (line, cut, breaks it, phone, tap, tunnel, Arrived, two views, end), quiet heartbeat pulses evenly between, chord changes exactly at scene changes, filter opens through the tunnel and resolves on Arrived, low "whumps" for the creature. No drums, no chimes. Rule: score audio to the edit.
- "i like style C the best for captions" → owner prefers short confident one-liners.
- "you can make it a bit more upbeat than that haha, if it means you have to speed it up a tiny bit no worries. also i dont like some of the sound effects they dont fit" → v5 (brand/video/parallax-promo-v5-final.mp4, 18.2 s): video re-timed so every key moment sits on a beat at 112 BPM (sync_points.json shared by record-sync.js and audio_v5.py). Audio: soft round bass pulse every beat (accented on key moments), warm plucked arpeggio in eighths from the phone on, pad chords change on scene beats; all "effects" are now notes/chords in key (stab on the cut, chord on "breaks it", four rising notes for typing, pluck on tap, rising run through the tunnel, full resolve on Arrived, end chord). No drums, no chimes, no whooshes.
- "not a fan of that audio try again, start over and make sure theres sound effects when shit is happening in the video, it sounds too mellow and minecraft music like" → v6 (brand/video/parallax-promo-v6.mp4, audio_v6.py): modern tech-launch sound. Pumping saw pad (sidechain on the beat), sub pulses, filtered 16th synth arp, bass in 8ths after the phone. Designed SFX on every event: digital ticks as the line draws, reverse swell → snap + impact on the cut, bass drop on "breaks it", whoosh on phone, UI key taps, data blip on price, deep button click, swoop on dive, riser into Arrived impact + stab, whoosh + hit on views, boop on peek, reverse swell → logo hit. Rule: no soft sine/piano "game music" tones; real SFX on events.
- Caption: owner likes "Swap across chains. Leave nothing to follow." but wants "swap coins across chains"-type wording.
- "i like it make the audio a little more hype tho, those sound effects sound much better" → v7 (brand/video/parallax-promo-v7.mp4, audio_v7.py): v6 + clean punchy drums that drop when the phone lands (kick every beat, clap on 2 & 4, off-beat hats; light hats before), tunnel build (16th hats + accelerating snare roll), full drop-out for the half-beat before Arrived then a bigger hit, drums out for the logo hit; brighter arp/pad, deeper pump, louder master (−14 LUFS). Note: owner now likes some hype — earlier "not hype" was about the trap version.
- "i dont like how the sound effect of the crypto sending makes the audio quieter, i lowkey dont like that audio at all. start over." → removed sidechain pumping and the pre-Arrived silence (owner hears them as the audio dropping). Three directions at once (audio_opts.py; all keep the v6 SFX, steady level): A tech house, B cinematic, C future bass → brand/video/parallax-promo-{A-techhouse,B-cinematic,C-futurebass}.mp4. Rule: never duck/gate the music under effects.
- Caption proposed by owner: "Swap your coins across chains. Leave no trace." (note: "no trace" slightly overclaims vs site wording — deposit and arrival are each public).
- (screenshot: light bars cut off at a hard edge) "i like the third one, but tweak it a little bit... those lines at the bottom, they get cut off and it looks a little choppy" → light bars now taper to nothing at both ends (more, thinner bars; height/opacity fall to zero) plus a soft side fade; future-bass tweaked (audio_c2.py): riser + snare build into the drop when the phone lands, full chord hits on Arrived and the logo, a mid-register supersaw lead line, quieter hats. File: brand/video/parallax-promo-v8-futurebass.mp4.
- "can you make it so when its sending on the phone that sound effect is quieter and doesnt effect the background music" → v9 (brand/video/parallax-promo-v9.mp4, audio_c3.py): tunnel riser cut to ~30% level and mostly tonal (much less noise), status swipe halved, so the limiter no longer pushes the music down while sending. Rule: SFX sit under the music, never mask it.
