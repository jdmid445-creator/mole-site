'use client';

import { useEffect, useState } from 'react';

// A small, real status line: it actually asks the swap network whether it's up.
export default function NetworkStatus({ className = '' }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch('/api/network-status')
        .then((r) => r.json())
        .then((d) => !cancelled && setState({ loading: false, ...d }))
        .catch(() => !cancelled && setState({ loading: false, online: false }));
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  let text = 'Checking the swap network…';
  let tone = 'pending';
  if (!state.loading && state.online) {
    text = `Swap network online. ${state.assets} assets ready across ${state.chains} chains.`;
    tone = 'up';
  } else if (!state.loading) {
    text = 'Swap network not responding right now. Try again shortly.';
    tone = 'down';
  }

  return (
    <p className={`net-status net-${tone} ${className}`} role="status" aria-live="polite">
      <span className="net-dot" aria-hidden="true" />
      {text}
    </p>
  );
}
