'use client';

import { INSTALL } from '@/lib/wallets';

// Lists the wallets this browser actually has. If there are none, shows where to get one.
export default function WalletPicker({ kind, chainLabel, wallets, onPick, onClose, onManual, onEnterAddress, busyId }) {
  const label = chainLabel || (kind === 'solana' ? 'Solana' : 'browser');
  // Hide install links for wallets already here ("Rabby Wallet" counts as Rabby, "Coinbase Wallet" as Coinbase).
  const names = wallets.map((w) => w.name.toLowerCase());
  const suggestions = INSTALL[kind].filter((w) => {
    const key = w.name.split(' ')[0].toLowerCase();
    return !names.some((n) => n.includes(key));
  });

  return (
    <div className="wpick" role="dialog" aria-label={`Choose a ${label} wallet`}>
      <div className="wpick-head">
        <strong>{wallets.length ? `Choose a ${label} wallet` : `No ${label} wallet found`}</strong>
        <button type="button" className="wpick-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {wallets.length ? (
        <ul className="wpick-list">
          {wallets.map((w) => (
            <li key={w.id}>
              <button type="button" className="wpick-item" onClick={() => onPick(w.id)} disabled={Boolean(busyId)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.icon} alt="" width={28} height={28} />
                <span>{w.name}</span>
                <em>{busyId === w.id ? 'Check your wallet…' : 'Detected'}</em>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="wpick-none">
          <p className="muted small wpick-note">
            There's no {label} wallet extension in this browser. Paying from Axiom, an exchange, or a wallet on your phone?
            Type your address and send it yourself.
          </p>
          {onEnterAddress ? (
            <button type="button" className="btn" onClick={onEnterAddress}>Enter my address instead</button>
          ) : null}
        </div>
      )}

      {onManual ? (
        <>
          <p className="wpick-sub">Trading app</p>
          <ul className="wpick-list">
            <li>
              <button type="button" className="wpick-item" onClick={onManual}>
                <span className="wpick-tile" aria-hidden="true">A</span>
                <span>Axiom</span>
                <em>Send from Axiom</em>
              </button>
            </li>
          </ul>
        </>
      ) : null}

      {suggestions.length && wallets.length ? (
        <>
          <p className="wpick-sub">Other wallets</p>
          <ul className="wpick-list">
            {suggestions.map((w) => (
              <li key={w.id}>
                <a className="wpick-item" href={w.href} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.icon} alt="" width={28} height={28} />
                  <span>{w.name}</span>
                  <em>Install ↗</em>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
