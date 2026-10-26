'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAINS, getChain, isValidAddress, addressHint, hasChecksumTypo } from '@/lib/chains';
import { toUnits, fromUnits, looksRound, suggestRound, displayAmount } from '@/lib/units';
import {
  connectSolana,
  connectEvm,
  sendSolMany,
  sendEvmNative,
  sendEvmToken,
  hasSolanaWallet,
  hasEvmWallet,
  detectSolanaWallets,
  detectEvmWallets,
  isMobile,
  walletAppLinks,
  INSTALL,
} from '@/lib/wallets';
import CopyButton from './CopyButton';
import ChainIcon from './ChainIcon';
import GhostWallet from './GhostWallet';
import WalletPicker from './WalletPicker';
import QrCode from './QrCode';
import RecentCrossings from './RecentCrossings';
import { addRecent, updateRecentStatus } from '@/lib/recent';
import { ghostKindFor } from '@/lib/ghost';

const STORAGE_KEY = 'mole-tunnel-pair-v1';
const TERMINAL = new Set(['SUCCESS', 'REFUNDED', 'FAILED']);
const MAX_SPLIT = 5;
const MIN_PCT = 5;
const STATUS_TEXT = {
  PENDING_DEPOSIT: 'Waiting for your deposit',
  KNOWN_DEPOSIT_TX: 'Deposit seen, confirming',
  PROCESSING: 'In the tunnel',
  SUCCESS: 'Arrived',
  INCOMPLETE_DEPOSIT: 'Deposit was smaller than quoted',
  REFUNDED: 'Refunded to your sending wallet',
  FAILED: 'Swap failed',
  UNKNOWN: 'Checking…',
};

// "≈ $18.40" from a token's USD price (from the swap network's token list). Empty when there is no price.
function usd(amount, price) {
  const v = Number(amount) * Number(price);
  if (!price || !Number.isFinite(v) || v <= 0) return '';
  if (v < 0.01) return '< $0.01';
  return `≈ $${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isNative(token, chain) {
  if (!token || !chain) return false;
  return !token.contractAddress;
}

function sortTokens(list, chain) {
  return [...list].sort((a, b) => {
    const an = isNative(a, chain) ? 0 : 1;
    const bn = isNative(b, chain) ? 0 : 1;
    return an - bn || String(a.symbol).localeCompare(String(b.symbol));
  });
}

function readSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSaved(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); Parallax works without it.
  }
}

const short = (a) => (a && a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

// Split percentages that add up to 100. Even = equal parts; otherwise random but never below MIN_PCT.
function makeSplit(n, even) {
  if (even) {
    const base = Math.floor(100 / n);
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? 100 - base * (n - 1) : base));
  }
  const weights = Array.from({ length: n }, () => 0.5 + Math.random());
  const total = weights.reduce((a, b) => a + b, 0);
  const free = 100 - MIN_PCT * n;
  const pcts = weights.map((w) => MIN_PCT + Math.floor((w / total) * free));
  pcts[n - 1] += 100 - pcts.reduce((a, b) => a + b, 0);
  return pcts;
}

// The overall state of a crossing made of one or more parts.
function overallStatus(parts) {
  const s = parts.map((p) => p.status);
  if (s.every((x) => x === s[0])) return s[0];
  if (s.some((x) => x === 'FAILED')) return 'FAILED';
  if (s.some((x) => ['KNOWN_DEPOSIT_TX', 'PROCESSING'].includes(x))) return 'PROCESSING';
  if (s.every((x) => TERMINAL.has(x))) return s.includes('SUCCESS') ? 'SUCCESS' : 'REFUNDED';
  if (s.some((x) => x === 'INCOMPLETE_DEPOSIT')) return 'INCOMPLETE_DEPOSIT';
  if (s.some((x) => x === 'SUCCESS' || x === 'REFUNDED')) return 'PROCESSING'; // some parts done, others still moving
  return 'PENDING_DEPOSIT';
}

export default function TunnelApp() {
  const [tokens, setTokens] = useState([]);
  const [networkChains, setNetworkChains] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const [fromChainKey, setFromChainKey] = useState('sol');
  const [toChainKey, setToChainKey] = useState('base');
  const [fromAssetId, setFromAssetId] = useState('');
  const [toAssetId, setToAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [manualRefund, setManualRefund] = useState('');
  const [wallet, setWallet] = useState({ type: '', address: '', name: '' });
  const [picker, setPicker] = useState(null); // { kind, wallets, busyId, thenSwap }
  const [payMode, setPayMode] = useState('wallet'); // 'wallet' = approve in your wallet, 'manual' = send it yourself
  const [previewNote, setPreviewNote] = useState('');
  const [payFrom, setPayFrom] = useState(''); // e.g. 'Axiom' when sending from a trading app's built-in wallet
  const [ack, setAck] = useState(false);
  const [ghostFor, setGhostFor] = useState(null); // 'single' | row index | null

  const [splitOn, setSplitOn] = useState(false);
  const [parts, setParts] = useState([
    { address: '', pct: 50 },
    { address: '', pct: 50 },
  ]);

  const [env, setEnv] = useState({ mobile: false, sol: true, evm: true });
  const [preview, setPreview] = useState(null);
  const [swap, setSwap] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [needApp, setNeedApp] = useState(false);
  const swapRef = useRef(null);

  const fromChain = getChain(fromChainKey);
  const toChain = getChain(toChainKey);

  const fromTokens = useMemo(
    () => sortTokens(tokens.filter((t) => t.blockchain === fromChainKey), fromChain),
    [tokens, fromChainKey, fromChain]
  );
  const toTokens = useMemo(
    () => sortTokens(tokens.filter((t) => t.blockchain === toChainKey), toChain),
    [tokens, toChainKey, toChain]
  );
  const fromToken = fromTokens.find((t) => t.assetId === fromAssetId) || fromTokens[0] || null;
  const toToken = toTokens.find((t) => t.assetId === toAssetId) || toTokens[0] || null;

  const walletMatches = Boolean(wallet.address && wallet.type === fromChain?.wallet);
  const useWallet = fromChain?.wallet !== 'deposit' && payMode === 'wallet';
  const pctTotal = parts.reduce((a, p) => a + (Number(p.pct) || 0), 0);

  useEffect(() => {
    swapRef.current = swap;
    if (swap) updateRecentStatus(swap.id, overallStatus(swap.parts));
  }, [swap]);

  // Which wallets this browser has (phones only get them inside the wallet's own app).
  useEffect(() => {
    setEnv({ mobile: isMobile(), sol: hasSolanaWallet(), evm: hasEvmWallet() });
  }, []);

  // Load supported assets once.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/tokens')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setLoadError(data.error);
        setTokens(Array.isArray(data.tokens) ? data.tokens : []);
        setNetworkChains(Array.isArray(data.networkChains) ? data.networkChains : []);
      })
      .catch(() => !cancelled && setLoadError('Could not load supported assets.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore the last pair on this device only.
  useEffect(() => {
    const saved = readSaved();
    if (!saved) return;
    if (getChain(saved.fromChainKey)) setFromChainKey(saved.fromChainKey);
    if (getChain(saved.toChainKey)) setToChainKey(saved.toChainKey);
    if (typeof saved.recipient === 'string') setRecipient(saved.recipient);
  }, []);

  useEffect(() => {
    setFromAssetId('');
    setPreview(null);
    setPicker(null);
    setPayFrom('');
  }, [fromChainKey]);

  useEffect(() => {
    setToAssetId('');
    setPreview(null);
    setGhostFor(null);
  }, [toChainKey]);

  // Poll every part's status while any is still in flight.
  const active = Boolean(swap && swap.parts.some((p) => !TERMINAL.has(p.status)));
  useEffect(() => {
    if (!active) return undefined;
    const id = swapRef.current?.id;
    let running = false;
    const tick = async () => {
      const cur = swapRef.current;
      if (!cur || cur.id !== id || running) return;
      running = true;
      try { await Promise.all(
        cur.parts.map(async (p, i) => {
          if (TERMINAL.has(p.status)) return;
          try {
            const res = await fetch(`/api/status?depositAddress=${encodeURIComponent(p.depositAddress)}`);
            const data = await res.json();
            if (!data || data.error || !data.status || data.status === 'UNKNOWN') return;
            const update = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined));
            setSwap((s) =>
              s && s.id === id
                ? { ...s, parts: s.parts.map((q, j) => (j === i && !TERMINAL.has(q.status) ? { ...q, ...update } : q)) }
                : s
            );
          } catch {
            // Keep polling; network blips are normal.
          }
        })
      ); } finally { running = false; }
    };
    tick();
    const t = setInterval(tick, 6000);
    return () => clearInterval(t);
  }, [active, swap?.id]);

  function updatePart(i, patch) {
    setParts((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    setPreview(null);
  }

  function setPartCount(n) {
    setParts((list) => {
      const pcts = makeSplit(n, true);
      return Array.from({ length: n }, (_, i) => ({ address: list[i]?.address || '', pct: pcts[i] }));
    });
    setGhostFor(null);
    setPreview(null);
  }

  function removePart(i) {
    setParts((list) => {
      const kept = list.filter((_, j) => j !== i);
      const pcts = makeSplit(kept.length, true);
      return kept.map((p, j) => ({ ...p, pct: pcts[j] }));
    });
    setGhostFor(null);
    setPreview(null);
  }

  function rebalance(even) {
    const pcts = makeSplit(parts.length, even);
    setParts((list) => list.map((p, i) => ({ ...p, pct: pcts[i] })));
    setPreview(null);
  }

  // Where the funds go: one wallet, or several with their share of the amount.
  function destinations(units) {
    const total = BigInt(units);
    if (!splitOn) return [{ address: recipient.trim(), units: total.toString() }];
    let given = 0n;
    return parts.map((p, i) => {
      const u = i === parts.length - 1 ? total - given : (total * BigInt(Math.round(Number(p.pct)))) / 100n;
      given += u;
      return { address: p.address.trim(), units: u.toString() };
    });
  }

  // Placeholder refund address used only for price previews before a wallet is chosen. Nothing is ever sent to it.
  // (Public BIP test-vector addresses for the deposit-only chains.)
  const PREVIEW_REFUND = {
    solana: 'So11111111111111111111111111111111111111112',
    evm: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
    btc: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
    doge: 'DBus3bamQjgJULBJtYXpEzDWQRwF5iwxgC',
    ltc: 'ltc1qjmxnz78nmc8nq77wuxh25n2es7rzm5c2rkk4wh',
    xrp: 'rHsMGQEkVNJmpGWs8XUBoTBiAAbwxZN5v3',
    tron: 'TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH',
  };

  function validate(refund, { preview = false, priceOnly = false } = {}) {
    if (!fromToken || !toToken) throw new Error('Pick what you send and what you receive.');
    if (fromToken.assetId === toToken.assetId) throw new Error('Pick a different asset or chain for the other side.');
    const units = toUnits(amount, fromToken.decimals);
    let refundAddr = (refund || '').trim();
    if (refundAddr && hasChecksumTypo(fromChainKey, refundAddr)) throw new Error('Refund address: it has a typo (its capital letters don\'t match). Copy it again from your wallet.');
    if (!isValidAddress(fromChainKey, refundAddr)) {
      const placeholder = PREVIEW_REFUND[fromChainKey] || PREVIEW_REFUND[fromChain.wallet];
      if (preview && placeholder) refundAddr = placeholder;
      else throw new Error(`Refund address: enter ${addressHint(fromChainKey).toLowerCase()} you control.`);
    }
    if (splitOn) {
      if (pctTotal !== 100) throw new Error(`The split adds up to ${pctTotal}%. It needs to be exactly 100%.`);
      if (parts.some((p) => Number(p.pct) < MIN_PCT)) throw new Error(`Each wallet needs at least ${MIN_PCT}% of the amount.`);
    }
    const dests = destinations(units);
    const seen = new Set();
    // For the live price only: an empty/unfinished destination gets a placeholder so the price shows as soon as you type
    // an amount. Nothing is created by a price check, and real swaps never use this.
    const destPlaceholder = PREVIEW_REFUND[toChainKey] || PREVIEW_REFUND[toChain?.wallet];
    dests.forEach((d, i) => {
      const label = splitOn ? `Wallet ${i + 1}` : 'Destination';
      if (priceOnly && !isValidAddress(toChainKey, d.address) && destPlaceholder) { d.address = destPlaceholder; d.placeholder = true; return; }
      if (hasChecksumTypo(toChainKey, d.address)) throw new Error(`${label}: this address has a typo (its capital letters don't match). Copy it again from your wallet.`);
      if (!isValidAddress(toChainKey, d.address)) throw new Error(`${label}: enter ${addressHint(toChainKey).toLowerCase()}.`);
      const key = d.address.toLowerCase();
      if (seen.has(key)) throw new Error(`${label} is used twice. Each part should land in a different wallet.`);
      seen.add(key);
      if (key === refundAddr.toLowerCase()) {
        throw new Error(`${label}: send to a different wallet than the one you send from. That is the whole point of Parallax.`);
      }
      if (BigInt(d.units) <= 0n) throw new Error(`${label}: the amount is too small to split this way.`);
    });
    return { units, dests, refundAddr };
  }

  async function quoteOne(dry, dest, refundAddr) {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dry,
        originAsset: fromToken.assetId,
        destinationAsset: toToken.assetId,
        amount: dest.units,
        recipient: dest.address,
        refundTo: refundAddr,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = String(data.error || '');
      if (/recipient is not valid|failed to get quote/i.test(msg) && !dest.placeholder) {
        throw new Error(`The network wouldn't accept ${short(dest.address)} as a destination. Double-check it, or use a different wallet (a fresh ghost wallet always works).`);
      }
      throw new Error(msg || 'Could not get a quote.');
    }
    return { ...data, units: dest.units, recipient: dest.address };
  }

  async function requestQuotes(dry, refund) {
    const { units, dests, refundAddr } = validate(refund, { preview: dry, priceOnly: dry });
    const results = await Promise.allSettled(dests.map((d) => quoteOne(dry, d, refundAddr)));
    const failed = results.findIndex((r) => r.status === 'rejected');
    if (failed !== -1) {
      const msg = results[failed].reason?.message || 'Could not get a quote.';
      throw new Error(dests.length > 1 ? `Wallet ${failed + 1}: ${msg}` : msg);
    }
    return { units, quotes: results.map((r) => r.value) };
  }

  // Live price: re-quote (dry run, nothing is created) shortly after the person stops typing.
  const quoteSeq = useRef(0);
  useEffect(() => {
    const seq = ++quoteSeq.current; // any reply from an earlier version of the form is now ignored
    if (swap || !amount || !Number(amount) || !fromToken || !toToken) {
      setPreview(null);
      setPreviewNote('');
      return undefined;
    }
    let ready = true;
    try {
      validate(useWallet ? (walletMatches ? wallet.address : '') : manualRefund, { preview: true, priceOnly: true });
    } catch (e) {
      ready = false;
      setPreview(null);
      setPreviewNote('');
    }
    if (!ready) return undefined;
    setPreviewNote('loading');
    const t = setTimeout(async () => {
      try {
        const { units, quotes } = await requestQuotes(true, useWallet ? (walletMatches ? wallet.address : '') : manualRefund);
        if (seq !== quoteSeq.current) return;
        const out = quotes.reduce((a, q) => a + (Number(q.amountOutFormatted) || 0), 0);
        const time = Math.max(...quotes.map((q) => Number(q.timeEstimate) || 0));
        setPreview({ units, quotes, out, time, confidentiality: quotes[0]?.confidentiality });
        setPreviewNote('');
      } catch (e) {
        if (seq !== quoteSeq.current) return;
        setPreview(null);
        setPreviewNote(e?.message || 'Could not get a price.');
      }
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromToken?.assetId, toToken?.assetId, recipient, parts, splitOn, payMode, manualRefund, wallet.address, swap]);

  // Returns the connected address, or '' if the person still has to choose (picker shown) or has no wallet.
  async function connectWith(kind, w) {
    setError('');
    setPicker((pk) => (pk ? { ...pk, busyId: w.id } : pk));
    try {
      const address = kind === 'solana' ? await connectSolana(w.id) : await connectEvm(w.id);
      setWallet({ type: kind, address, name: w.name });
      setPicker(null);
      return address;
    } catch (e) {
      setError(e?.message || 'Could not connect wallet.');
      setPicker((pk) => (pk ? { ...pk, busyId: '' } : pk));
      return '';
    }
  }

  async function chooseWallet({ thenSwap = false } = {}) {
    setError('');
    setNeedApp(false);
    const kind = fromChain.wallet;
    const wallets = kind === 'solana' ? detectSolanaWallets() : await detectEvmWallets();
    if (wallets.length === 1 && !(walletMatches && !thenSwap)) {
      return connectWith(kind, wallets[0]);
    }
    if (!wallets.length && appLinks.length) {
      setNeedApp(true);
      return '';
    }
    setPicker({ kind, wallets, busyId: '', thenSwap });
    return '';
  }

  // One tap on a named wallet: connect it if it's installed, otherwise open its download page.
  async function quickWallet(item) {
    setError('');
    const kind = fromChain.wallet;
    const wallets = kind === 'solana' ? detectSolanaWallets() : await detectEvmWallets();
    const first = (n) => String(n || '').toLowerCase().split(' ')[0];
    const found = wallets.find((w) => w.id === item.id || first(w.name) === first(item.name));
    if (found) return connectWith(kind, found);
    window.open(item.href, '_blank', 'noopener,noreferrer');
    return '';
  }

  async function onPickWallet(id) {
    const pk = picker;
    const w = pk.wallets.find((x) => x.id === id);
    const address = await connectWith(pk.kind, w);
    if (address && pk.thenSwap) await runSwap(address);
  }

  function submitTx(txHash, depositAddress) {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash, depositAddress }),
    }).catch(() => {});
  }

  // The one button. With a wallet: opens it to approve, then the swap runs. Without: hands out deposit addresses.
  const swapLock = useRef(false);
  async function onSwap() {
    if (swapLock.current) return; // a second click while the first is still going does nothing
    swapLock.current = true;
    try {
      setError('');
      if (!ack) {
        setError('Tick the box to confirm you understand what Parallax hides and what it does not.');
        return;
      }
      if (!useWallet) {
        await runSwap('');
        return;
      }
      try {
        validate('', { preview: true });
      } catch (e) {
        setError(e?.message || 'Check the form.');
        return;
      }
      let address = '';
      if (walletMatches) address = wallet.address;
      else {
        setBusy('open');
        try { address = await chooseWallet({ thenSwap: true }); } finally { setBusy(''); }
      }
      if (address) await runSwap(address);
    } finally {
      swapLock.current = false;
    }
  }

  async function runSwap(senderAddress) {
    setBusy('open');
    let id = '';
    const mine = () => swapRef.current?.id === id;
    const sender = senderAddress || '';
    const autoSend =
      Boolean(sender) &&
      fromToken &&
      (isNative(fromToken, fromChain) || (fromChain.wallet === 'evm' && Boolean(fromToken.contractAddress)));
    try {
      const { units, quotes } = await requestQuotes(false, sender || manualRefund);
      if (quotes.some((q) => !q.depositAddress)) throw new Error('The network did not return a deposit address. Try again.');
      writeSaved({ fromChainKey, toChainKey, recipient: recipient.trim() });

      id = `${Date.now()}`;
      const mode = autoSend ? 'wallet' : 'deposit';
      const created = {
        id,
        split: quotes.length > 1,
        payFrom: autoSend ? '' : payFrom,
        amountIn: fromUnits(units, fromToken.decimals),
        symbolIn: fromToken.symbol,
        symbolOut: toToken.symbol,
        priceIn: fromToken.price ?? null,
        priceOut: toToken.price ?? null,
        confidentiality: quotes[0]?.confidentiality,
        parts: quotes.map((q) => ({
          depositAddress: q.depositAddress,
          depositMemo: q.depositMemo,
          recipient: q.recipient,
          amountIn: fromUnits(q.units, fromToken.decimals),
          amountOutFormatted: q.amountOutFormatted,
          status: 'PENDING_DEPOSIT',
          txHash: '',
          mode,
        })),
      };
      swapRef.current = created; // record it now, not after the next render, so the checks below see it
      setSwap(created);
      addRecent({
        id,
        deposits: created.parts.map((p) => p.depositAddress),
        amountIn: created.amountIn,
        symbolIn: created.symbolIn,
        symbolOut: created.symbolOut,
        fromLabel: fromChain.label,
        toLabel: toChain.label,
        status: 'PENDING_DEPOSIT',
      });

      if (!autoSend) return;

      const setPartTx = (i, txHash) =>
        setSwap((s) => (s && s.id === id ? { ...s, parts: s.parts.map((p, j) => (j === i ? { ...p, txHash } : p)) } : s));

      if (fromChain.wallet === 'solana') {
        // One transaction, one signature, every deposit address paid at once.
        const txHash = await sendSolMany({
          from: sender,
          payments: quotes.map((q) => ({ to: q.depositAddress, lamports: q.units })),
        });
        quotes.forEach((q, i) => {
          setPartTx(i, txHash);
          if (txHash) submitTx(txHash, q.depositAddress);
        });
      } else {
        // EVM wallets approve one transfer at a time.
        for (let i = 0; i < quotes.length; i += 1) {
          if (!mine()) return; // the person started over; stop asking their wallet
          const q = quotes[i];
          const txHash = isNative(fromToken, fromChain)
            ? await sendEvmNative({ from: sender, to: q.depositAddress, wei: q.units, chainId: fromChain.chainId })
            : await sendEvmToken({
                from: sender,
                to: q.depositAddress,
                token: fromToken.contractAddress,
                amount: q.units,
                chainId: fromChain.chainId,
              });
          setPartTx(i, txHash);
          if (txHash) submitTx(txHash, q.depositAddress);
        }
      }
    } catch (e) {
      if (id && !mine()) return; // an abandoned run must not change a newer swap
      const msg = e?.message || 'Something went wrong.';
      setError(/reject|denied|cancel/i.test(msg) ? 'You cancelled in your wallet. You can send it yourself below, or start over.' : msg);
      // Anything not yet sent can still be paid by hand.
      setSwap((s) => (s && (!id || s.id === id) ? { ...s, parts: s.parts.map((p) => (p.txHash ? p : { ...p, mode: 'deposit' })) } : s));
    } finally {
      if (!id || mine() || !swapRef.current) setBusy('');
    }
  }

  function reset() {
    swapRef.current = null;
    setSwap(null);
    setPreview(null);
    setAmount('');
    setAck(false);
    setError('');
  }

  function rememberBeforeLeaving() {
    writeSaved({ fromChainKey, toChainKey, recipient: recipient.trim() });
  }

  const status = swap ? overallStatus(swap.parts) : '';
  const moving = swap && ['KNOWN_DEPOSIT_TX', 'PROCESSING'].includes(status);
  const done = swap && status === 'SUCCESS';
  const ghostKind = ghostKindFor(toChainKey);
  const walletKind = fromChain?.wallet;
  const noInjected = (walletKind === 'solana' && !env.sol) || (walletKind === 'evm' && !env.evm);
  const appLinks = env.mobile && noInjected ? walletAppLinks(walletKind) : [];
  const pendingDeposits = swap ? swap.parts.filter((p) => p.mode === 'deposit' && !p.txHash && p.status === 'PENDING_DEPOSIT') : [];

  return (
    <div className="tunnel-app">
      <div className={`tunnel-visual${moving ? ' is-moving' : ''}${done ? ' is-done' : ''}`} aria-hidden="true">
        <div className="portal portal-public">
          <ChainIcon chain={fromChain?.key} size={34} className="portal-icon" />
          <span className="portal-chain">{fromChain?.label}</span>
          <span className="portal-asset">{fromToken?.symbol || '—'}</span>
        </div>
        <div className="tunnel-track">
          <span className="tunnel-dot" />
        </div>
        <div className="portal portal-private">
          <ChainIcon chain={toChain?.key} size={34} className="portal-icon" />
          <span className="portal-chain">{toChain?.label}</span>
          <span className="portal-asset">
            {toToken?.symbol || '—'}
            {splitOn && !swap ? ` × ${parts.length}` : swap?.split ? ` × ${swap.parts.length}` : ''}
          </span>
        </div>
      </div>

      {loadError ? (
        <p className="notice notice-error" role="alert">
          {loadError} {networkChains.length ? null : 'The swap network may be unreachable right now.'}
        </p>
      ) : null}

      {!swap ? (
        <form className="tunnel-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="side">
            <legend>From your wallet</legend>
            <div className="field-row">
              <label className="field">
                <span>Chain</span>
                <select value={fromChainKey} onChange={(e) => setFromChainKey(e.target.value)}>
                  {CHAINS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Asset</span>
                <select value={fromToken?.assetId || ''} onChange={(e) => { setFromAssetId(e.target.value); setPreview(null); }} disabled={!fromTokens.length}>
                  {fromTokens.length ? (
                    fromTokens.map((t) => <option key={t.assetId} value={t.assetId}>{t.symbol}</option>)
                  ) : (
                    <option value="">{loading ? 'Loading…' : 'Not available'}</option>
                  )}
                </select>
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value.replace(',', '.')); setPreview(null); }}
                />
              </label>
            </div>

            {walletKind === 'deposit' ? (
              <>
                <p className="pay-note">You'll get a one-time deposit address (with a QR code). Send your {fromChain.native} to it from any wallet or exchange.</p>
                <label className="field">
                  <span>Refund address</span>
                  <input placeholder={addressHint(fromChainKey)} value={manualRefund} onChange={(e) => setManualRefund(e.target.value)} />
                  <small className="field-hint">If anything fails, your coins come back here. Use a wallet you control, not an exchange deposit address.</small>
                </label>
              </>
            ) : (
              <>
                <div className="pay-how">
                  <span className="pay-how-label">How do you want to pay?</span>
                  <div className="split-toggle" role="group" aria-label="How to pay">
                    <button type="button" className={payMode === 'wallet' ? 'is-active' : ''} aria-pressed={payMode === 'wallet'} onClick={() => { setPayMode('wallet'); setPayFrom(''); setError(''); }}>
                      Connect a wallet
                    </button>
                    <button type="button" className={payMode === 'manual' ? 'is-active' : ''} aria-pressed={payMode === 'manual'} onClick={() => { setPayMode('manual'); setPicker(null); setError(''); setNeedApp(false); }}>
                      Send it yourself
                    </button>
                  </div>
                </div>
                {payMode === 'manual' ? (
                  <>
                    <p className="pay-note">
                      {payFrom
                        ? `You'll get a one-time deposit address (with a QR code). In ${payFrom}, tap Withdraw and send your ${fromToken?.symbol || fromChain.native} to it. Nothing to connect.`
                        : `You'll get a one-time deposit address (with a QR code). Send your ${fromToken?.symbol || fromChain.native} to it from${walletKind === 'solana' ? ' Axiom,' : ''} an exchange, or any wallet. Nothing to connect.`}
                    </p>
                    <label className="field">
                      <span>Refund address</span>
                      <input placeholder={addressHint(fromChainKey)} value={manualRefund} onChange={(e) => setManualRefund(e.target.value)} />
                      <small className="field-hint">If anything fails, your coins come back here. Use a wallet you control, not an exchange deposit address.</small>
                    </label>
                  </>
                ) : walletMatches ? (
                  <p className="wallet-line">
                    Paying with {wallet.name || 'your wallet'}: <code className="mono">{short(wallet.address)}</code>
                    <button type="button" className="wallet-switch" onClick={() => chooseWallet()}>Change</button>
                  </p>
                ) : appLinks.length ? (
                  <div className="open-in">
                    <p className="open-in-title">On your phone? Open Parallax in your wallet app to swap:</p>
                    <div className="open-in-row">
                      {appLinks.map((l) => (
                        <a key={l.name} className="btn" href={l.href} onClick={rememberBeforeLeaving}>
                          Open in {l.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="connect-row">
                    <button type="button" className="btn btn-connect" onClick={() => chooseWallet()} disabled={Boolean(picker?.busyId) || Boolean(busy)}>
                      {picker?.busyId ? 'Check your wallet…' : `Connect ${fromChain.label} wallet`}
                    </button>
                    <p className="pay-note">You approve the swap once in your wallet.</p>
                  </div>
                )}
                {!walletMatches && !appLinks.length && INSTALL[walletKind] ? (
                  <div className="wallet-quick" role="group" aria-label="Wallets">
                    {INSTALL[walletKind].map((w) => (
                      <button key={w.id} type="button" className="ghost-app" onClick={() => quickWallet(w)} disabled={Boolean(picker?.busyId)}>
                        <img src={w.icon} alt="" width="20" height="20" />
                        {w.name}
                      </button>
                    ))}
                    {walletKind === 'solana' ? (
                      <button type="button" className="ghost-app" onClick={() => { setPayMode('manual'); setPayFrom('Axiom'); setPicker(null); setError(''); }}>
                        <span className="ghost-app-tile" aria-hidden="true">A</span>
                        Axiom
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
            {picker && picker.kind === walletKind ? (
              <WalletPicker
                kind={picker.kind}
                chainLabel={fromChain.label}
                wallets={picker.wallets}
                busyId={picker.busyId}
                onPick={onPickWallet}
                onManual={picker.kind === 'solana' ? () => { setPayMode('manual'); setPayFrom('Axiom'); setPicker(null); setError(''); } : null}
                onClose={() => setPicker(null)}
              />
            ) : null}
            {amount && !looksRound(amount) ? (
              <p className="tip">Tip: round amounts blend in. Something like {suggestRound(amount)} is harder to match than {amount}.</p>
            ) : null}
          </fieldset>

          <fieldset className="side">
            <legend>To your private wallet</legend>
            <div className="field-row">
              <label className="field">
                <span>Chain</span>
                <select value={toChainKey} onChange={(e) => setToChainKey(e.target.value)}>
                  {CHAINS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Asset</span>
                <select value={toToken?.assetId || ''} onChange={(e) => { setToAssetId(e.target.value); setPreview(null); }} disabled={!toTokens.length}>
                  {toTokens.length ? (
                    toTokens.map((t) => <option key={t.assetId} value={t.assetId}>{t.symbol}</option>)
                  ) : (
                    <option value="">{loading ? 'Loading…' : 'Not available'}</option>
                  )}
                </select>
              </label>
            </div>

            <div className="split-toggle" role="group" aria-label="Destination">
              <button type="button" className={!splitOn ? 'is-active' : ''} aria-pressed={!splitOn} onClick={() => { setSplitOn(false); setGhostFor(null); setPreview(null); }}>
                One wallet
              </button>
              <button type="button" className={splitOn ? 'is-active' : ''} aria-pressed={splitOn} onClick={() => { setSplitOn(true); setGhostFor(null); setPreview(null); }}>
                Split across wallets
              </button>
            </div>

            {!splitOn ? (
              <>
                <label className="field">
                  <span>Destination wallet (a fresh one is best)</span>
                  <input placeholder={addressHint(toChainKey)} value={recipient} onChange={(e) => { setRecipient(e.target.value); setPreview(null); }} />
                </label>
                {toChainKey === 'xrp' ? (
                  <p className="hint">Use your own XRP wallet, not an exchange deposit address. Exchanges need a destination tag, and funds sent without one can be lost.</p>
                ) : null}
                {ghostKind ? (
                  ghostFor === 'single' ? (
                    <GhostWallet
                      key={`single-${ghostKind}`}
                      initialKind={ghostKind}
                      lockKind
                      compact
                      onUse={(addr) => { setRecipient(addr); setPreview(null); setGhostFor(null); }}
                    />
                  ) : (
                    <button type="button" className="ghost-link" onClick={() => setGhostFor('single')}>
                      No fresh wallet? Create a ghost wallet here
                    </button>
                  )
                ) : null}
              </>
            ) : (
              <div className="split">
                <p className="split-intro">
                  Each wallet gets its own private crossing. They arrive separately, from different network addresses.
                  {fromChain.wallet === 'solana' ? ' Still one signature from your Solana wallet.' : fromChain.wallet === 'evm' ? ' Your wallet will ask you to approve each part.' : ''}
                </p>
                <ol className="split-rows">
                  {parts.map((p, i) => (
                    <li key={i} className="split-row">
                      <span className="split-num">{i + 1}</span>
                      <input
                        className="split-addr"
                        aria-label={`Wallet ${i + 1} address`}
                        placeholder={addressHint(toChainKey)}
                        value={p.address}
                        onChange={(e) => updatePart(i, { address: e.target.value })}
                      />
                      <label className="split-pct">
                        <input
                          inputMode="numeric"
                          aria-label={`Wallet ${i + 1} share in percent`}
                          value={p.pct}
                          onChange={(e) => updatePart(i, { pct: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) })}
                        />
                        <span>%</span>
                      </label>
                      {ghostKind ? (
                        <button type="button" className="split-ghost" onClick={() => setGhostFor(ghostFor === i ? null : i)} aria-label={`Create a ghost wallet for wallet ${i + 1}`}>
                          Ghost
                        </button>
                      ) : null}
                      {parts.length > 2 ? (
                        <button type="button" className="split-remove" onClick={() => removePart(i)} aria-label={`Remove wallet ${i + 1}`}>
                          ×
                        </button>
                      ) : null}
                      {amount && fromToken ? (
                        <span className="split-amt">
                          {(() => {
                            try {
                              const d = destinations(toUnits(amount, fromToken.decimals))[i];
                              return `${fromUnits(d.units, fromToken.decimals)} ${fromToken.symbol}`;
                            } catch {
                              return '';
                            }
                          })()}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
                {typeof ghostFor === 'number' && ghostKind ? (
                  <GhostWallet
                    key={`row-${ghostFor}-${ghostKind}`}
                    initialKind={ghostKind}
                    lockKind
                    compact
                    onUse={(addr) => { updatePart(ghostFor, { address: addr }); setGhostFor(null); }}
                  />
                ) : null}
                <div className="split-tools">
                  {parts.length < MAX_SPLIT ? (
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => setPartCount(parts.length + 1)}>+ Add wallet</button>
                  ) : null}
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => rebalance(true)}>Even split</button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => rebalance(false)}>Shuffle amounts</button>
                  <span className={`split-total${pctTotal === 100 ? '' : ' is-off'}`}>Total {pctTotal}%</span>
                </div>
                <p className="hint">Uneven amounts are harder to match than equal ones. Shuffle mixes them up for you.</p>
              </div>
            )}
          </fieldset>

          {!preview && previewNote ? (
            <p className={previewNote === 'loading' ? 'quote-note' : 'quote-note is-error'} aria-live="polite">
              {previewNote === 'loading' ? 'Getting the best price…' : previewNote}
            </p>
          ) : null}
          {preview ? (
            <div className={`quote-wrap${previewNote === 'loading' ? ' is-refreshing' : ''}`} aria-live="polite">
              <div className="quote">
                <div>
                  <span className="muted small">You send</span>
                  <strong>{fromUnits(preview.units, fromToken.decimals)} {fromToken.symbol}</strong>
                  {usd(fromUnits(preview.units, fromToken.decimals), fromToken.price) ? <span className="usd">{usd(fromUnits(preview.units, fromToken.decimals), fromToken.price)}</span> : null}
                </div>
                <div>
                  <span className="muted small">{preview.quotes.length > 1 ? 'About, in total' : 'About'}</span>
                  <strong>{displayAmount(String(preview.out))} {toToken.symbol}</strong>
                  {usd(preview.out, toToken.price) ? <span className="usd">{usd(preview.out, toToken.price)}</span> : null}
                </div>
                <div>
                  <span className="muted small">Time</span>
                  <strong>{preview.time ? `~${preview.time}s` : '—'}</strong>
                </div>
                <div>
                  <span className="muted small">Mode</span>
                  <strong>{preview.confidentiality === 'public' ? 'Public' : 'Confidential'}</strong>
                </div>
              </div>
              {preview.quotes.length > 1 ? (
                <ul className="quote-parts">
                  {preview.quotes.map((q, i) => (
                    <li key={i}>
                      <span className="split-num">{i + 1}</span>
                      <code className="mono">{short(q.recipient)}</code>
                      <span>{fromUnits(q.units, fromToken.decimals)} {fromToken.symbol}</span>
                      <span className="muted">→</span>
                      <strong>~{displayAmount(q.amountOutFormatted)} {toToken.symbol}</strong>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <label className="check">
            <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); if (e.target.checked && /Tick the box/.test(error)) setError(''); }} />
            <span>
              I understand Parallax hides the link between my wallets, not the deposit or the arrival themselves, and that
              this site never holds my funds.
            </span>
          </label>

          {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
          {needApp && appLinks.length && payMode !== 'manual' ? (
            <div className="open-in open-in-swap" role="status">
              <p className="open-in-title">To swap from your phone, open Parallax inside your wallet app:</p>
              <div className="open-in-row">
                {appLinks.map((l) => (
                  <a key={l.name} className="btn" href={l.href} onClick={rememberBeforeLeaving}>
                    Open in {l.name}
                  </a>
                ))}
              </div>
              <button type="button" className="text-link" onClick={() => { setPayMode('manual'); setPayFrom(''); setNeedApp(false); }}>
                Or pay from any wallet or exchange
              </button>
            </div>
          ) : null}

          <button type="button" className="btn btn-swap" onClick={onSwap} disabled={Boolean(busy) || Boolean(picker?.busyId)}>
            {busy === 'open'
              ? (useWallet ? 'Check your wallet…' : 'Getting your address…')
              : useWallet
                ? splitOn ? `Swap privately to ${parts.length} wallets` : 'Swap privately'
                : splitOn ? 'Get deposit addresses' : 'Get deposit address'}
          </button>
        </form>
      ) : (
        <div className="swap-panel" aria-live="polite">
          <p className="status-line">
            <span className={`status-pill status-${String(status).toLowerCase()}`}>{STATUS_TEXT[status] || status}</span>
            <span className="muted small">
              {swap.confidentiality === 'public' ? 'Public mode' : 'Confidential mode'}
              {swap.split ? ` · split across ${swap.parts.length} wallets` : ''}
            </span>
          </p>

          {pendingDeposits.length ? (
            <div className="deposit-box">
              {pendingDeposits.length === 1 && !swap.split ? (
                <p>
                  {swap.payFrom ? `In ${swap.payFrom}, tap Withdraw and send exactly ` : 'From any wallet or exchange, send exactly '}
                  <strong>{pendingDeposits[0].amountIn} {swap.symbolIn}</strong> on {fromChain.label} to this deposit address:
                </p>
              ) : (
                <p>
                  Send each amount on {fromChain.label} to its own deposit address. Exact amounts matter: each address is for one part only.
                </p>
              )}
              {pendingDeposits.map((p) => (
                <div key={p.depositAddress} className="deposit-item has-qr">
                  {pendingDeposits.length > 1 || swap.split ? (
                    <p className="deposit-amt"><strong>{p.amountIn} {swap.symbolIn}</strong> to:</p>
                  ) : null}
                  <p className="mono-row">
                    <code className="mono">{p.depositAddress}</code>
                    <CopyButton value={p.depositAddress} />
                  </p>
                  {p.depositMemo ? (
                    <p className="mono-row">
                      Memo/tag: <code className="mono">{p.depositMemo}</code>
                      <CopyButton value={p.depositMemo} />
                    </p>
                  ) : null}
                  <QrCode value={p.depositAddress} size={pendingDeposits.length > 1 ? 132 : 168} label={p.depositMemo ? 'Scan for the address (add the memo by hand)' : 'Scan to send from your phone or exchange'} />
                </div>
              ))}
              <p className="muted small">These addresses are for this crossing only. The page updates on its own once deposits land.</p>
            </div>
          ) : null}

          <dl className="swap-facts">
            <div>
              <dt>Sending</dt>
              <dd>{swap.amountIn} {swap.symbolIn} on {fromChain.label}{usd(swap.amountIn, swap.priceIn) ? <span className="usd"> {usd(swap.amountIn, swap.priceIn)}</span> : null}</dd>
            </div>
            {!swap.split ? (
              <div>
                <dt>Arriving</dt>
                <dd>{swap.parts[0].amountOutFormatted ? `~${displayAmount(swap.parts[0].amountOutFormatted)}` : '—'} {swap.symbolOut} on {toChain.label}{usd(swap.parts[0].amountOutFormatted, swap.priceOut) ? <span className="usd"> {usd(swap.parts[0].amountOutFormatted, swap.priceOut)}</span> : null}</dd>
              </div>
            ) : null}
            {swap.parts[0].txHash && (!swap.split || swap.parts.every((p) => p.txHash === swap.parts[0].txHash)) ? (
              <div>
                <dt>Your deposit</dt>
                <dd>
                  <a href={`${fromChain.explorer}${swap.parts[0].txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a>
                </dd>
              </div>
            ) : null}
            {!swap.split && swap.parts[0].destinationTx ? (
              <div>
                <dt>Arrival</dt>
                <dd>
                  <a href={`${toChain.explorer}${swap.parts[0].destinationTx}`} target="_blank" rel="noopener noreferrer">View transaction</a>
                </dd>
              </div>
            ) : null}
          </dl>

          {swap.split ? (
            <ol className="split-status">
              {swap.parts.map((p, i) => (
                <li key={p.depositAddress}>
                  <span className="split-num">{i + 1}</span>
                  <span className="split-status-main">
                    <code className="mono">{short(p.recipient)}</code>
                    <span className="muted small">
                      {p.amountIn} {swap.symbolIn} → ~{displayAmount(p.amountOutFormatted)} {swap.symbolOut}
                    </span>
                  </span>
                  <span className={`status-pill status-${String(p.status).toLowerCase()}`}>{STATUS_TEXT[p.status] || p.status}</span>
                  <span className="split-links">
                    {p.txHash && swap.parts.some((q) => q.txHash !== p.txHash) ? (
                      <a href={`${fromChain.explorer}${p.txHash}`} target="_blank" rel="noopener noreferrer">Deposit</a>
                    ) : null}
                    {p.destinationTx ? (
                      <a href={`${toChain.explorer}${p.destinationTx}`} target="_blank" rel="noopener noreferrer">Arrival</a>
                    ) : null}
                    <a href={`/track?d=${encodeURIComponent(p.depositAddress)}`}>Track</a>
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

          {swap.parts.some((p) => p.status === 'INCOMPLETE_DEPOSIT') ? (
            <p className="notice">A deposit was smaller than quoted. That part will be refunded to your refund address.</p>
          ) : null}
          {swap.parts.some((p) => p.status === 'FAILED') ? (
            <p className="notice notice-error">A swap failed. Funds that reached the network are refunded to your refund address.</p>
          ) : null}

          <p className="muted small">
            Keep this page open until it says Arrived
            {!swap.split ? (
              <>
                , or <a href={`/track?d=${encodeURIComponent(swap.parts[0].depositAddress)}`}>track it later</a> with the deposit address
              </>
            ) : (
              ', or track each part later with its link above'
            )}
            . Don't send from a destination wallet back to your sending wallet directly; that links them.
          </p>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            {TERMINAL.has(status) ? 'Start a new swap' : 'Start over'}
          </button>
        </div>
      )}

      {!swap ? <RecentCrossings /> : null}

      {!loading && !tokens.length && networkChains.length ? (
        <p className="muted small">Network chains reported: {networkChains.join(', ')}</p>
      ) : null}
    </div>
  );
}
