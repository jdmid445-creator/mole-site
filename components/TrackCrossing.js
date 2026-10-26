'use client';

import { useEffect, useRef, useState } from 'react';
import CopyButton from './CopyButton';

const STAGES = [
  { key: 'deposit', label: 'Waiting for deposit' },
  { key: 'seen', label: 'Deposit seen' },
  { key: 'crossing', label: 'Crossing' },
  { key: 'done', label: 'Arrived' },
];

const STAGE_INDEX = {
  PENDING_DEPOSIT: 0,
  INCOMPLETE_DEPOSIT: 1,
  KNOWN_DEPOSIT_TX: 1,
  PROCESSING: 2,
  SUCCESS: 3,
  REFUNDED: 3,
  FAILED: 2,
};

const TERMINAL = new Set(['SUCCESS', 'REFUNDED', 'FAILED']);

const MESSAGES = {
  PENDING_DEPOSIT: 'No deposit has reached this address yet.',
  KNOWN_DEPOSIT_TX: 'The deposit was seen and is being confirmed.',
  PROCESSING: 'The swap is running in the network.',
  SUCCESS: 'Arrived. The funds reached the destination wallet.',
  INCOMPLETE_DEPOSIT: 'The deposit was smaller than quoted. It will be refunded to the refund address.',
  REFUNDED: 'Refunded to the refund address.',
  FAILED: 'This swap failed. Funds that reached the network are refunded to the refund address.',
};

export default function TrackCrossing() {
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState(null); // { addr, n } — n lets you re-check the same address
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false); // only for checks you started, never background refreshes
  const timer = useRef(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('d');
    if (fromUrl) {
      setAddress(fromUrl);
      setQuery({ addr: fromUrl, n: 0 });
    }
  }, []);

  useEffect(() => {
    if (!query) return undefined;
    let cancelled = false;
    const stop = () => { clearInterval(timer.current); timer.current = null; };

    const check = async (background) => {
      if (!background) setChecking(true);
      try {
        const res = await fetch(`/api/status?depositAddress=${encodeURIComponent(query.addr)}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || data.error) {
          if (res.status === 400 || res.status === 404) {
            // Not found / bad address: show it once and stop asking.
            stop();
            setResult(null);
            setError(res.status === 404 ? 'No crossing found for that deposit address. Check you pasted the deposit address (the one you sent funds to), not your own wallet.' : data.error || 'That does not look like a deposit address.');
          } else if (!background) {
            setError('The swap network did not answer. Try again in a moment.');
          }
          return;
        }
        setError('');
        setResult(data);
        if (TERMINAL.has(data.status)) stop();
      } catch {
        if (!cancelled && !background) setError('Could not reach the swap network. Check your connection and try again.');
      } finally {
        if (!cancelled && !background) setChecking(false);
      }
    };

    stop();
    check(false);
    timer.current = setInterval(() => check(true), 6000);
    return () => { cancelled = true; stop(); };
  }, [query]);

  function onSubmit(e) {
    e.preventDefault();
    const value = address.trim();
    if (!value) {
      setError('Paste the deposit address from your crossing.');
      return;
    }
    setResult(null);
    setError('');
    setQuery((q) => ({ addr: value, n: (q?.n || 0) + 1 }));
    try {
      const url = new URL(window.location.href); url.searchParams.set('d', value);
      window.history.replaceState(null, '', url);
    } catch {}
  }

  function onType(v) {
    setAddress(v);
    if (error) setError('');
  }

  const stage = result ? STAGE_INDEX[result.status] ?? 0 : -1;
  const failed = result && (result.status === 'FAILED' || result.status === 'REFUNDED' || result.status === 'INCOMPLETE_DEPOSIT');

  return (
    <div className="track">
      <form className="track-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Deposit address</span>
          <input
            value={address}
            onChange={(e) => onType(e.target.value)}
            placeholder="The address you sent your funds to"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        <button type="submit" className="btn" disabled={checking}>
          {checking ? 'Checking…' : 'Check status'}
        </button>
      </form>

      {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

      {result ? (
        <div className="track-result" aria-live="polite">
          <ol className={`track-stages${failed ? ' is-failed' : ''}`}>
            {STAGES.map((s, i) => (
              <li key={s.key} className={i < stage ? 'is-done' : i === stage ? 'is-current' : ''}>
                <span className="track-dot" aria-hidden="true" />
                {i === 3 && result.status === 'REFUNDED' ? 'Refunded' : s.label}
              </li>
            ))}
          </ol>
          <p className="track-message">{MESSAGES[result.status] || `Status: ${result.status}`}</p>
          <dl className="swap-facts">
            {result.amountOutFormatted ? (
              <div><dt>Amount out</dt><dd>{result.amountOutFormatted}</dd></div>
            ) : null}
            {result.originTx ? (
              <div>
                <dt>Deposit transaction</dt>
                <dd className="mono-row"><code className="mono">{result.originTx.slice(0, 10)}…{result.originTx.slice(-6)}</code><CopyButton value={result.originTx} /></dd>
              </div>
            ) : null}
            {result.destinationTx ? (
              <div>
                <dt>Arrival transaction</dt>
                <dd className="mono-row"><code className="mono">{result.destinationTx.slice(0, 10)}…{result.destinationTx.slice(-6)}</code><CopyButton value={result.destinationTx} /></dd>
              </div>
            ) : null}
          </dl>
          {!TERMINAL.has(result.status) ? <p className="muted small">Updates on its own every few seconds.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
