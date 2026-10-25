'use client';

import { INSTALL } from '@/lib/wallets';

// Lists the wallets this browser actually has. If there are none, shows where to get one.
export default function WalletPicker({ kind, chainLabel, wallets, onPick, onClose, onManual, busyId }) {
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
        <p className="muted small wpick-note">
          Install a wallet extension, then refresh this page. Or close this and send manually with a refund address.
        </p>
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

      {suggestions.length ? (
        <>
          <p className="wpick-sub">{wallets.length ? 'Other wallets' : 'Get a wallet'}</p>
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
