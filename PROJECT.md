# PROJECT.md

Living notes for this project. Claude keeps it current; the owner corrects it in chat.
Last updated: 2026-10-24.

## Goal (one sentence)

A website where you move crypto from one chain to another (e.g. SOL → ETH on Base) without a public
link between the wallet you send from and the wallet you receive in — with a meme coin launched
alongside it. **Product first, coin second.**

## Audience

Solana meme traders / degens who don't want their wallets tracked.
They should: land, get it in ~5 seconds, try the Tunnel, feel "this is legit, not another rug", then buy the coin.

## Done this week (draft — owner to confirm)

1. Name locked.
2. Site renamed, on a clean custom domain, live.
3. One successful real test swap (small amounts, secondary wallet → fresh wallet).
4. Final logo + banner in the chosen name.
5. Launch on pump.fun; contract address + dev wallet shown on the site.

## What exists

| Thing | Where | Status |
|---|---|---|
| Code | GitHub `jdmid445-creator/mole-site` (branch `main`) | Next.js 14, JS, auto-deploys to Vercel on push |
| Live site | https://mole-site-mu.vercel.app | Live. Currently branded **$TUNNEL** — owner rejected that name, rename pending |
| Hosting | Vercel project `mole-site` (team YOSH) | Env vars set: `HELIUS_API_KEY`, `NEAR_INTENTS_JWT` (all envs) |
| Swap rails | NEAR Intents 1Click API, `confidentiality: advanced` | Partner account "MOLE", Distribution Channel key |
| Logo | Design canvas "$MOLE Logo" → artboard **"★ Night, peeking out"** | Final mascot: deep-violet creature peeking out of a dark hole, lime eyes, pink nose, soft glow, on #0C0A18 |
| Domain / X / Telegram | — | None yet |
| Token | — | Not launched. Launching on pump.fun (Solana) |

## Product: the Tunnel

- Non-custodial front-end for NEAR Intents 1Click swaps with confidential mode on. Site never holds funds or keys.
- Chains at launch: Solana, Ethereum, Base, Arbitrum, BNB (one-click via browser wallet), Bitcoin (deposit mode).
- Zero app fee (owner doesn't want to earn from the tech; money comes from the coin).
- Honest framing: hides the *link* between wallets; deposit and arrival are still public. "Private, not invisible."
- Verified 2026-10-24: `/api/health` shows both keys; Preview quote 0.1 SOL → ~0.00432 ETH on Base, ~24s, confidential mode accepted. **Not yet verified: a real end-to-end swap.**

## Stack

Next.js 14 (App Router, plain JS), @solana/web3.js, injected EVM wallets (no WalletConnect yet), server API routes
proxy NEAR (`/api/tokens`, `/api/quote`, `/api/status`, `/api/submit`, `/api/solana/blockhash`, `/api/health`).
Fonts: Sora + JetBrains Mono. Palette: bg #0C0A18, violet #5A41D6/#7B62F0, lime #C8FF2E, pink #FF8FB8.

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

- **Name.** Rejected so far include: $ZERO (initially liked), $MOLE (initially "fw mole", later wanted change), $TUNNEL ("tunnel sucks"), and long lists of others.
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
