'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RECENT_EVENT, loadRecent } from '@/lib/recent';

const DONE = new Set(['SUCCESS', 'REFUNDED', 'FAILED']);
const DAY = 24 * 60 * 60 * 1000;

// "My crossings" in the menu, with a small live badge while a crossing on this device is still moving.
// (Ones never paid within a day don't count as live.)
export default function NavCrossings() {
  const [live, setLive] = useState(0);
  useEffect(() => {
    const sync = () => setLive(loadRecent().filter((c) => !DONE.has(c.status) && Date.now() - (c.at || 0) < DAY).length);
    sync();
    window.addEventListener(RECENT_EVENT, sync);
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 30000);
    return () => { window.removeEventListener(RECENT_EVENT, sync); window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);
  return (
    <Link href="/track" className={`nav-crossings${live ? ' has-live' : ''}`} aria-label={live ? `My crossings, ${live} in progress` : 'My crossings'}>
      <span className="nc-text">My crossings</span>
      {live ? <span className="nc-badge"><span className="nc-dot" aria-hidden="true" />{live}</span> : null}
    </Link>
  );
}
