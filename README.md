# $MOLE — a private tunnel between any two chains

Website for the $MOLE meme coin and **the Tunnel**: a non-custodial front-end for
[NEAR Intents](https://docs.near-intents.org) 1Click swaps with confidential mode switched on.
Users send from one chain and receive on another without a public link between the two wallets.
The site never holds funds or keys.

## Pages

- `/` — home: pitch, how it works, what's hidden vs visible, token info
- `/tunnel` — the Tunnel app
- `/terms` — terms and privacy limits
- `/api/health` — shows which settings are configured (never their values)

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Required | What it's for |
|---|---|---|
| `HELIUS_API_KEY` | Recommended | Solana RPC for one-click SOL sends |
| `NEAR_INTENTS_JWT` | Optional | NEAR Intents API key; without it each swap carries an extra 0.25% fee |
| `NEAR_CONFIDENTIALITY` | Optional | `advanced` (default), `basic` or `public` |
| `NEAR_INTENTS_BASE_URL` | Optional | Override the 1Click API URL (default `https://1click.chaindefuser.com`) |
| `NEXT_PUBLIC_TOKEN_CA` | At launch | $MOLE contract address |
| `NEXT_PUBLIC_DEV_WALLET` | At launch | Public dev wallet |
| `NEXT_PUBLIC_X_URL` | Optional | X profile link |
| `NEXT_PUBLIC_TG_URL` | Optional | Telegram link |

Secrets are only read on the server. Never commit them.

## Supported at launch

Solana, Ethereum, Base, Arbitrum and BNB Chain (one-click with a browser wallet) and Bitcoin
(deposit mode: send from any wallet to the address shown). Edit `lib/chains.js` to add chains.

## Local development

```bash
npm install
npm run dev
```
