'use client';

import { useEffect, useState } from 'react';
import { RECENT_EVENT, clearRecent, loadRecent } from '@/lib/recent';

const LABEL = {
  PENDING_DEPOSIT: 'Waiting for deposit',
  KNOWN_DEPOSIT_TX: 'Deposit seen',
  PROCESSING: 'Crossing',
  SUCCESS: 'Arrived',
  INCOMPLETE_DEPOSIT: 'Deposit too small',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
  PARTIAL: 'Partly refunded',
};

function when(ts) {
  const d = new Date(ts);
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// "Your recent crossings": only what this browser saved. Hidden when there is nothing to show.
export default function RecentCrossings({ title = 'Your recent crossings', showEmpty = false }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    const sync = () => setList(loadRecent());
    sync();
    window.addEventListener(RECENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(RECENT_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);
  if (!list.length) {
    if (!showEmpty) return null;
    return (
      <section className="recent recent-empty" aria-label={title}>
        <h2 className="recent-title">{title}</h2>
        <p className="muted small">Crossings you start on this device show up here, so you can find them again even if you close the tab. They’re saved only in this browser.</p>
      </section>
    );
  }
  return (
    <section className="recent" aria-label={title}>
      <div className="recent-head">
        <h2 className="recent-title">{title}</h2>
        <button type="button" className="text-link" onClick={() => { clearRecent(); setList([]); }}>Forget these</button>
      </div>
      <ul className="recent-list">
        {list.map((c) => (
          <li key={c.id} className="recent-item">
            <span className="recent-main">
              <strong>{c.amountIn} {c.symbolIn}</strong>
              <span className="muted"> {c.fromLabel} → {c.symbolOut} {c.toLabel}</span>
              {c.deposits.length > 1 ? <span className="muted"> · {c.deposits.length} wallets</span> : null}
            </span>
            <span className="recent-meta">
              <span className={`status-pill status-${String(c.status || 'PENDING_DEPOSIT').toLowerCase()}`}>{LABEL[c.status] || 'Checking'}</span>
              <span className="muted small">{when(c.at)}</span>
            </span>
            <span className="recent-links">
              {c.deposits.map((d, i) => (
                <a key={d} href={`/track?d=${encodeURIComponent(d)}`}>{c.deposits.length > 1 ? `Track ${i + 1}` : 'Track'}</a>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">Saved only in this browser, so you can find a crossing again. Never your destination wallet.</p>
    </section>
  );
}
