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
| Live site | https://mole-site-mu.vercel.app | Live. Branded **Parallax** (renamed 2026-10-24). Confirmed loading on owner's phone (cellular); owner's laptop network timed out on `*.vercel.app` at 22:11, so custom domain needed anyway |
| Hosting | Vercel project `mole-site` (team YOSH) | Env vars set: `HELIUS_API_KEY`, `NEAR_INTENTS_JWT` (all envs) |
| Swap rails | NEAR Intents 1Click API, `confidentiality: advanced` | Partner account "MOLE", Distribution Channel key |
| Logo | Design canvas "$MOLE Logo" → artboard **"★ Night, peeking out"** | Final mascot: deep-violet creature peeking out of a dark hole, lime eyes, pink nose, soft glow, on #0C0A18 |
| Domain / X / Telegram | — | None yet |
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
Fonts: Sora + JetBrains Mono. Palette: bg #0C0A18, violet #5A41D6/#7B62F0, lime #C8FF2E, pink #FF8FB8.

## Design (v2, 2026-10-24)

References from owner: blackout.exchange, vanish.trade/us, veilit.xyz, web-4.app.
- Veil + Web4 read fully; Blackout + Vanish render client-side, so only titles/colors were readable (Blackout bg #0b0b0f, tagline "trade perps nobody can see"). Ask owner for screenshots if we need to match them more closely.
- Shared traits taken: near-black base, very short headlines, numbered steps, hidden-vs-public explanation, stats with real numbers, FAQ, closing CTA.
- Deliberately skipped: scrolling ticker, ALL-CAPS labels, arrows on buttons, identical card grids.
- Signature element: **parallax hero**, two tilted chain planes (Solana behind, Base in front) drifting with the pointer at different depths, creature between. Static on touch devices and with reduced motion.
- Story section "Two views, no line": what Solana sees vs what Base sees.
- Type: Bricolage Grotesque (opsz + wdth axes) for everything; JetBrains Mono only for addresses.
- Copy: hero "Seen from one chain, it left. Seen from the other, it arrived." Primary action everywhere is "Make a crossing".
- Real numbers only: 1 signature, 0 funds held, 0% app fee, 6 chains, ~24s from our test quote.

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
