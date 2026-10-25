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
- Verified 2026-10-24: `/api/health` shows both keys; Preview quote 0.1 SOL → ~0.00432 ETH on Base, ~24s, confidential mode accepted. **Not yet verified: a real end-to-end swap.**

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
