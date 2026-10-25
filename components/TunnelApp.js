'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAINS, getChain, isValidAddress, addressHint } from '@/lib/chains';
import { toUnits, fromUnits, looksRound, displayAmount } from '@/lib/units';
import { connectSolana, connectEvm, sendSol, sendEvmNative, sendEvmToken } from '@/lib/wallets';
import CopyButton from './CopyButton';

const STORAGE_KEY = 'mole-tunnel-pair-v1';
const TERMINAL = new Set(['SUCCESS', 'REFUNDED', 'FAILED']);
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

function isNative(token, chain) {
  if (!token || !chain) return false;
  return !token.contractAddress || token.symbol === chain.native;
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
    // Storage can be unavailable (private mode); the Tunnel works without it.
  }
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
  const [wallet, setWallet] = useState({ type: '', address: '' });
  const [ack, setAck] = useState(false);

  const [preview, setPreview] = useState(null);
  const [swap, setSwap] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

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

  const walletMatches = wallet.address && wallet.type === fromChain?.wallet;
  const refundTo = walletMatches ? wallet.address : manualRefund.trim();
  const canOneClick =
    walletMatches &&
    fromToken &&
    (isNative(fromToken, fromChain) || (fromChain.wallet === 'evm' && Boolean(fromToken.contractAddress)));

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
  }, [fromChainKey]);

  useEffect(() => {
    setToAssetId('');
    setPreview(null);
  }, [toChainKey]);

  // Poll status while a swap is in flight.
  useEffect(() => {
    if (!swap?.depositAddress || TERMINAL.has(swap.status)) return undefined;
    const tick = async () => {
      try {
        const res = await fetch(`/api/status?depositAddress=${encodeURIComponent(swap.depositAddress)}`);
        const data = await res.json();
        if (data && !data.error) {
          setSwap((s) => (s && s.depositAddress === swap.depositAddress ? { ...s, ...data } : s));
        }
      } catch {
        // Keep polling; network blips are normal.
      }
    };
    tick();
    pollRef.current = setInterval(tick, 6000);
    return () => clearInterval(pollRef.current);
  }, [swap?.depositAddress, swap?.status]);

  function validate() {
    if (!fromToken || !toToken) throw new Error('Pick what you send and what you receive.');
    if (fromToken.assetId === toToken.assetId) throw new Error('Pick a different asset or chain for the other side.');
    const units = toUnits(amount, fromToken.decimals);
    if (!isValidAddress(toChainKey, recipient)) throw new Error(`Destination: enter ${addressHint(toChainKey).toLowerCase()}.`);
    if (!isValidAddress(fromChainKey, refundTo)) {
      throw new Error(
        fromChain.wallet === 'deposit'
          ? `Refund address: enter ${addressHint(fromChainKey).toLowerCase()} you control.`
          : 'Connect your wallet, or enter a refund address you control.'
      );
    }
    if (recipient.trim().toLowerCase() === refundTo.toLowerCase()) {
      throw new Error('Send to a different wallet than the one you send from. That is the whole point of the tunnel.');
    }
    return units;
  }

  async function requestQuote(dry) {
    const units = validate();
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dry,
        originAsset: fromToken.assetId,
        destinationAsset: toToken.assetId,
        amount: units,
        recipient: recipient.trim(),
        refundTo,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Could not get a quote.');
    return { ...data, units };
  }

  async function onConnect() {
    setError('');
    try {
      if (fromChain.wallet === 'solana') setWallet({ type: 'solana', address: await connectSolana() });
      else if (fromChain.wallet === 'evm') setWallet({ type: 'evm', address: await connectEvm() });
    } catch (e) {
      setError(e?.message || 'Could not connect wallet.');
    }
  }

  async function onPreview() {
    setError('');
    setBusy('preview');
    try {
      setPreview(await requestQuote(true));
    } catch (e) {
      setPreview(null);
      setError(e?.message || 'Could not get a quote.');
    } finally {
      setBusy('');
    }
  }

  async function onOpen() {
    setError('');
    if (!ack) {
      setError('Tick the box to confirm you understand what the Tunnel hides and what it does not.');
      return;
    }
    setBusy('open');
    try {
      const quote = await requestQuote(false);
      if (!quote.depositAddress) throw new Error('The network did not return a deposit address. Try again.');
      writeSaved({ fromChainKey, toChainKey, recipient: recipient.trim() });

      const next = {
        depositAddress: quote.depositAddress,
        depositMemo: quote.depositMemo,
        amountUnits: quote.units,
        amountIn: fromUnits(quote.units, fromToken.decimals),
        symbolIn: fromToken.symbol,
        symbolOut: toToken.symbol,
        amountOutFormatted: quote.amountOutFormatted,
        confidentiality: quote.confidentiality,
        mode: canOneClick ? 'wallet' : 'deposit',
        status: 'PENDING_DEPOSIT',
        txHash: '',
      };
      setSwap(next);

      if (canOneClick) {
        let txHash;
        if (fromChain.wallet === 'solana') {
          txHash = await sendSol({ from: wallet.address, to: quote.depositAddress, lamports: quote.units });
        } else if (isNative(fromToken, fromChain)) {
          txHash = await sendEvmNative({ from: wallet.address, to: quote.depositAddress, wei: quote.units, chainId: fromChain.chainId });
        } else {
          txHash = await sendEvmToken({
            from: wallet.address,
            to: quote.depositAddress,
            token: fromToken.contractAddress,
            amount: quote.units,
            chainId: fromChain.chainId,
          });
        }
        setSwap((s) => (s ? { ...s, txHash } : s));
        if (txHash) {
          fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHash, depositAddress: quote.depositAddress }),
          }).catch(() => {});
        }
      }
    } catch (e) {
      setError(e?.message || 'Something went wrong.');
      setSwap((s) => (s && !s.txHash ? { ...s, mode: 'deposit' } : s));
    } finally {
      setBusy('');
    }
  }

  function reset() {
    setSwap(null);
    setPreview(null);
    setAmount('');
    setAck(false);
    setError('');
  }

  const moving = swap && ['KNOWN_DEPOSIT_TX', 'PROCESSING'].includes(swap.status);
  const done = swap && swap.status === 'SUCCESS';

  return (
    <div className="tunnel-app">
      <div className={`tunnel-visual${moving ? ' is-moving' : ''}${done ? ' is-done' : ''}`} aria-hidden="true">
        <div className="portal portal-public">
          <span className="portal-chain">{fromChain?.label}</span>
          <span className="portal-asset">{fromToken?.symbol || '—'}</span>
        </div>
        <div className="tunnel-track">
          <span className="tunnel-dot" />
        </div>
        <div className="portal portal-private">
          <span className="portal-chain">{toChain?.label}</span>
          <span className="portal-asset">{toToken?.symbol || '—'}</span>
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
            <legend>Send from</legend>
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

            {fromChain.wallet === 'deposit' ? (
              <label className="field">
                <span>Refund address (if the swap fails, funds return here)</span>
                <input placeholder={addressHint(fromChainKey)} value={manualRefund} onChange={(e) => setManualRefund(e.target.value)} />
              </label>
            ) : walletMatches ? (
              <p className="wallet-line">
                Connected: <code className="mono">{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</code>
              </p>
            ) : (
              <div className="wallet-actions">
                <button type="button" className="btn" onClick={onConnect}>
                  Connect {fromChain.wallet === 'solana' ? 'Solana wallet' : 'browser wallet'}
                </button>
                <label className="field field-inline">
                  <span>or send manually; refund address:</span>
                  <input placeholder={addressHint(fromChainKey)} value={manualRefund} onChange={(e) => setManualRefund(e.target.value)} />
                </label>
              </div>
            )}
            {amount && !looksRound(amount) ? (
              <p className="hint">Round amounts blend in better. Something like {Number(amount).toFixed(1)} is harder to match.</p>
            ) : null}
          </fieldset>

          <fieldset className="side">
            <legend>Arrive at</legend>
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
            <label className="field">
              <span>Destination wallet (a fresh one is best)</span>
              <input placeholder={addressHint(toChainKey)} value={recipient} onChange={(e) => { setRecipient(e.target.value); setPreview(null); }} />
            </label>
          </fieldset>

          {preview ? (
            <div className="quote" aria-live="polite">
              <div>
                <span className="muted small">You send</span>
                <strong>{fromUnits(preview.units, fromToken.decimals)} {fromToken.symbol}</strong>
              </div>
              <div>
                <span className="muted small">About</span>
                <strong>{displayAmount(preview.amountOutFormatted)} {toToken.symbol}</strong>
              </div>
              <div>
                <span className="muted small">Time</span>
                <strong>{preview.timeEstimate ? `~${preview.timeEstimate}s` : '—'}</strong>
              </div>
              <div>
                <span className="muted small">Mode</span>
                <strong>{preview.confidentiality === 'public' ? 'Public' : 'Confidential'}</strong>
              </div>
            </div>
          ) : null}

          <label className="check">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>
              I understand the Tunnel hides the link between my wallets, not the deposit or the arrival themselves, and that
              this site never holds my funds.
            </span>
          </label>

          {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

          <div className="cta-row">
            <button type="button" className="btn btn-ghost" onClick={onPreview} disabled={Boolean(busy)}>
              {busy === 'preview' ? 'Getting quote…' : 'Preview quote'}
            </button>
            <button type="button" className="btn" onClick={onOpen} disabled={Boolean(busy)}>
              {busy === 'open' ? 'Opening…' : canOneClick ? 'Open tunnel & send' : 'Open tunnel'}
            </button>
          </div>
        </form>
      ) : (
        <div className="swap-panel" aria-live="polite">
          <p className="status-line">
            <span className={`status-pill status-${String(swap.status).toLowerCase()}`}>{STATUS_TEXT[swap.status] || swap.status}</span>
            <span className="muted small">{swap.confidentiality === 'public' ? 'Public mode' : 'Confidential mode'}</span>
          </p>

          {swap.mode === 'deposit' && !swap.txHash && swap.status === 'PENDING_DEPOSIT' ? (
            <div className="deposit-box">
              <p>
                Send exactly <strong>{swap.amountIn} {swap.symbolIn}</strong> on {fromChain.label} to this deposit address:
              </p>
              <p className="mono-row">
                <code className="mono">{swap.depositAddress}</code>
                <CopyButton value={swap.depositAddress} />
              </p>
              {swap.depositMemo ? (
                <p className="mono-row">
                  Memo/tag: <code className="mono">{swap.depositMemo}</code>
                  <CopyButton value={swap.depositMemo} />
                </p>
              ) : null}
              <p className="muted small">This address is for this swap only. The page updates on its own once the deposit lands.</p>
            </div>
          ) : null}

          <dl className="swap-facts">
            <div>
              <dt>Sending</dt>
              <dd>{swap.amountIn} {swap.symbolIn} on {fromChain.label}</dd>
            </div>
            <div>
              <dt>Arriving</dt>
              <dd>{swap.amountOutFormatted ? `~${displayAmount(swap.amountOutFormatted)}` : '—'} {swap.symbolOut} on {toChain.label}</dd>
            </div>
            {swap.txHash ? (
              <div>
                <dt>Your deposit</dt>
                <dd>
                  <a href={`${fromChain.explorer}${swap.txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a>
                </dd>
              </div>
            ) : null}
            {swap.destinationTx ? (
              <div>
                <dt>Arrival</dt>
                <dd>
                  <a href={`${toChain.explorer}${swap.destinationTx}`} target="_blank" rel="noopener noreferrer">View transaction</a>
                </dd>
              </div>
            ) : null}
          </dl>

          {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

          {swap.status === 'INCOMPLETE_DEPOSIT' ? (
            <p className="notice">The deposit was smaller than quoted. It will be refunded to your refund address.</p>
          ) : null}
          {swap.status === 'FAILED' ? (
            <p className="notice notice-error">The swap failed. Funds that reached the network are refunded to your refund address.</p>
          ) : null}

          <p className="muted small">
            Keep this page open until it says Arrived, or save the deposit address to check later. Don't send from the destination
            wallet back to your sending wallet directly; that links them.
          </p>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            {TERMINAL.has(swap.status) ? 'Start a new tunnel' : 'Start over'}
          </button>
        </div>
      )}

      {!loading && !tokens.length && networkChains.length ? (
        <p className="muted small">Network chains reported: {networkChains.join(', ')}</p>
      ) : null}
    </div>
  );
}
