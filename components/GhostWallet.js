'use client';

import { useRef, useState } from 'react';
import { GHOST_APPS, GHOST_KINDS, createGhostWallet, downloadBackup } from '@/lib/ghost';
import ChainIcon from './ChainIcon';
import CopyButton from './CopyButton';

// Generates a fresh wallet in the browser and walks the person through saving it.
// `onUse(address)` lets the swap form drop the new address straight into the destination field.
export default function GhostWallet({ initialKind = 'solana', lockKind = false, onUse, compact = false }) {
  const [kind, setKind] = useState(initialKind);
  const [wallet, setWallet] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const kindRef = useRef(kind);
  kindRef.current = kind;
  const [error, setError] = useState('');

  async function generate() {
    setBusy(true);
    setError('');
    setRevealed(false);
    setSaved(false);
    const forKind = kind;
    try {
      const w = await createGhostWallet(forKind);
      setWallet((cur) => (kindRef.current === forKind ? w : cur)); // ignore if you switched type meanwhile
    } catch (e) {
      setError(e?.message || 'Could not create a wallet.');
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    setWallet(null);
    setRevealed(false);
    setSaved(false);
  }

  return (
    <div className={`ghost${compact ? ' ghost-compact' : ''}`}>
      {!lockKind ? (
        <div className="ghost-kinds" role="group" aria-label="Wallet type">
          {Object.entries(GHOST_KINDS).map(([k, v]) => (
            <button key={k} type="button" className={kind === k ? 'is-active' : ''} aria-pressed={kind === k} disabled={busy} onClick={() => { setKind(k); discard(); }}>
              <ChainIcon chain={v.icon} size={18} />
              {v.label}
            </button>
          ))}
        </div>
      ) : null}

      {!wallet ? (
        <div className="ghost-start">
          <p className="muted">
            Works on {GHOST_KINDS[kind].covers}. Created in this browser tab; the keys are never sent to us or stored.
          </p>
          <button type="button" className="btn" onClick={generate} disabled={busy}>
            {busy ? 'Creating…' : `Create a ${GHOST_KINDS[kind].label} ghost wallet`}
          </button>
        </div>
      ) : (
        <div className="ghost-card">
          <div className="ghost-row">
            <span className="ghost-label">Address</span>
            <span className="mono-row">
              <code className="mono">{wallet.address}</code>
              <CopyButton value={wallet.address} />
            </span>
          </div>

          <div className="ghost-row">
            <span className="ghost-label">{wallet.secretLabel}</span>
            {revealed ? (
              <span className="mono-row">
                <code className="mono ghost-secret">{wallet.secret}</code>
                <CopyButton value={wallet.secret} />
              </span>
            ) : (
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setRevealed(true)}>
                Reveal {wallet.secretLabel.toLowerCase()}
              </button>
            )}
          </div>

          <p className="notice ghost-warning">
            Anyone with this {wallet.secretLabel.toLowerCase()} controls the wallet, and nobody can recover it for you. Save it now,
            then import it into {GHOST_KINDS[wallet.kind].importIn.split(' → ')[0]}. Treat it as a wallet for receiving and moving
            funds, not long-term storage.
          </p>

          <div className="cta-row">
            <button type="button" className="btn btn-ghost" onClick={() => { downloadBackup(wallet); }}>
              Download backup (.txt)
            </button>
            <button type="button" className="btn btn-ghost" onClick={discard}>Discard</button>
          </div>

          <label className="check">
            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
            <span>I saved the {wallet.secretLabel.toLowerCase()} somewhere safe.</span>
          </label>

          {onUse ? (
            <button type="button" className="btn" disabled={!saved} onClick={() => onUse(wallet.address)}>
              {saved ? 'Use this as my destination' : 'Save it first, then use it'}
            </button>
          ) : (
            <p className="muted small">
              How to import: {GHOST_KINDS[wallet.kind].importIn}.
            </p>
          )}
          {GHOST_APPS[wallet.kind]?.length ? (
            <div className="ghost-apps">
              <span className="ghost-label">Open it in</span>
              <div className="ghost-apps-row">
                {GHOST_APPS[wallet.kind].map((app) => (
                  <a key={app.name} className="ghost-app" href={app.href} target="_blank" rel="noopener noreferrer">
                    {app.icon ? <img src={app.icon} alt="" width="20" height="20" /> : <span className="ghost-app-tile" aria-hidden="true">{app.name[0]}</span>}
                    {app.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
    </div>
  );
}
