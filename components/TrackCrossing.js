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
  const [active, setActive] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('d');
    if (fromUrl) {
      setAddress(fromUrl);
      setActive(fromUrl);
    }
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;

    const check = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/status?depositAddress=${encodeURIComponent(active)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || data.error) {
          setResult(null);
          setError(res.status === 404 ? 'No crossing found for that deposit address.' : data.error || 'Could not check that address.');
          return;
        }
        setError('');
        setResult(data);
        if (TERMINAL.has(data.status)) clearInterval(timer.current);
      } catch {
        if (!cancelled) setError('Could not reach the swap network. Try again shortly.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    check();
    timer.current = setInterval(check, 6000);
    return () => {
      cancelled = true;
      clearInterval(timer.current);
    };
  }, [active]);

  function onSubmit(e) {
    e.preventDefault();
    const value = address.trim();
    if (!value) {
      setError('Paste the deposit address from your crossing.');
      return;
    }
    setResult(null);
    setActive(value);
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
            onChange={(e) => setAddress(e.target.value)}
            placeholder="The address you sent your funds to"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        <button type="submit" className="btn" disabled={loading && !result}>
          {loading && !result ? 'Checking…' : 'Check status'}
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
