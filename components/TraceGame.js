'use client';

import { useMemo, useState } from 'react';
import ChainIcon from './ChainIcon';

// "Try to trace it": match deposits on Solana to arrivals on Base.
// Careless habits (odd amounts, instant timing) are easy to trace; careful habits are guesswork.
// All data here is a made-up demo.

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const RATE = 0.0432; // ETH per SOL, from our real test quote (0.1 SOL ≈ 0.00432 ETH)

const SCENARIOS = {
  careless: {
    deposits: [
      { from: '7xKp…3fQa', amount: '3.1742 SOL', time: '14:02:11' },
      { from: 'Gm4T…9vLe', amount: '0.8815 SOL', time: '14:02:40' },
      { from: 'B2qN…Hx7c', amount: '12.406 SOL', time: '14:03:05' },
      { from: 'Fd9R…2kWp', amount: '5.0927 SOL', time: '14:03:31' },
      { from: 'Qa1Z…mE4s', amount: '1.7733 SOL', time: '14:04:02' },
    ],
    // arrival i came from deposit truth[i]; shown in this order
    arrivals: [
      { to: '0x91…a3c0', from: 3, time: '14:03:58' },
      { to: '0x2b…77e1', from: 0, time: '14:02:37' },
      { to: '0xc4…0d19', from: 4, time: '14:04:29' },
      { to: '0x5f…e2b8', from: 1, time: '14:03:06' },
      { to: '0x8a…41f5', from: 2, time: '14:03:33' },
    ],
  },
  careful: {
    deposits: [
      { from: '7xKp…3fQa', amount: '1 SOL', time: '14:02' },
      { from: 'Gm4T…9vLe', amount: '1 SOL', time: '14:19' },
      { from: 'B2qN…Hx7c', amount: '1 SOL', time: '14:47' },
      { from: 'Fd9R…2kWp', amount: '1 SOL', time: '15:30' },
      { from: 'Qa1Z…mE4s', amount: '1 SOL', time: '16:05' },
    ],
    arrivals: [
      { to: '0x91…a3c0', from: 2, time: '14:55' },
      { to: '0x2b…77e1', from: 4, time: '15:12' },
      { to: '0xc4…0d19', from: 0, time: '16:40' },
      { to: '0x5f…e2b8', from: 3, time: '17:02' },
      { to: '0x8a…41f5', from: 1, time: '18:21' },
    ],
  },
};

function ethFor(amount) {
  const sol = parseFloat(amount);
  const eth = sol * RATE * 0.997;
  return eth >= 0.1 ? eth.toFixed(4) : eth.toFixed(5);
}

export default function TraceGame() {
  const [mode, setMode] = useState('careless');
  const [picked, setPicked] = useState(null); // deposit index waiting for a match
  const [guesses, setGuesses] = useState({}); // arrival index -> deposit index
  const [revealed, setRevealed] = useState(false);

  const scenario = SCENARIOS[mode];
  const arrivals = useMemo(
    () =>
      scenario.arrivals.map((a) => ({
        ...a,
        amount: mode === 'careful' ? `${(RATE * 0.997).toFixed(4)} ETH` : `${ethFor(scenario.deposits[a.from].amount)} ETH`,
      })),
    [scenario, mode]
  );

  const usedDeposits = new Set(Object.values(guesses));
  const guessCount = Object.keys(guesses).length;
  const score = arrivals.reduce((n, a, i) => (guesses[i] === a.from ? n + 1 : n), 0);

  function switchMode(next) {
    setMode(next);
    setPicked(null);
    setGuesses({});
    setRevealed(false);
  }

  function pickDeposit(i) {
    if (revealed) return;
    setPicked((p) => (p === i ? null : i));
  }

  function pickArrival(i) {
    if (revealed) return;
    if (picked === null) {
      // Clicking a matched arrival clears that guess.
      if (guesses[i] !== undefined) {
        const next = { ...guesses };
        delete next[i];
        setGuesses(next);
      }
      return;
    }
    const next = { ...guesses };
    Object.keys(next).forEach((k) => {
      if (next[k] === picked) delete next[k];
    });
    next[i] = picked;
    setGuesses(next);
    setPicked(null);
  }

  let verdict = '';
  if (revealed) {
    verdict =
      mode === 'careless'
        ? `${score} of 5. Odd amounts and instant timing leave fingerprints. Anyone watching can do this.`
        : `${score} of 5. Round amounts and spaced-out timing turn it into pure guesswork. That’s the point.`;
  }

  return (
    <div className="trace">
      <div className="trace-modes" role="group" aria-label="Habits">
        <button type="button" className={mode === 'careless' ? 'is-active' : ''} aria-pressed={mode === 'careless'} onClick={() => switchMode('careless')}>
          Careless habits
        </button>
        <button type="button" className={mode === 'careful' ? 'is-active' : ''} aria-pressed={mode === 'careful'} onClick={() => switchMode('careful')}>
          Careful habits
        </button>
      </div>

      <p className="trace-help">
        {revealed
          ? verdict
          : picked !== null
            ? `Now pick the arrival you think came from ${LETTERS[picked]}.`
            : 'Pick a deposit on the left, then the arrival on the right you think it became.'}
      </p>

      <div className="trace-board">
        <div className="trace-col">
          <p className="trace-col-title"><ChainIcon chain="sol" size={22} /> Leaving Solana</p>
          <ul>
            {scenario.deposits.map((d, i) => (
              <li key={d.from}>
                <button
                  type="button"
                  className={`trace-item${picked === i ? ' is-picked' : ''}${usedDeposits.has(i) ? ' is-used' : ''}`}
                  onClick={() => pickDeposit(i)}
                  aria-pressed={picked === i}
                  disabled={revealed}
                >
                  <span className="trace-tag">{LETTERS[i]}</span>
                  <span className="trace-main">{d.amount}</span>
                  <span className="trace-meta">{d.from} · {d.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="trace-col">
          <p className="trace-col-title"><ChainIcon chain="base" size={22} /> Arriving on Base</p>
          <ul>
            {arrivals.map((a, i) => {
              const guess = guesses[i];
              const right = revealed && guess === a.from;
              const wrong = revealed && guess !== undefined && guess !== a.from;
              return (
                <li key={a.to}>
                  <button
                    type="button"
                    className={`trace-item${right ? ' is-right' : ''}${wrong ? ' is-wrong' : ''}${picked !== null && !revealed ? ' is-target' : ''}`}
                    onClick={() => pickArrival(i)}
                    disabled={revealed}
                  >
                    <span className={`trace-tag${guess === undefined ? ' is-empty' : ''}`}>{guess === undefined ? '?' : LETTERS[guess]}</span>
                    <span className="trace-main">{a.amount}</span>
                    <span className="trace-meta">
                      {a.to} · {a.time}
                      {revealed ? <strong className="trace-truth"> was {LETTERS[a.from]}</strong> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="trace-actions">
        {!revealed ? (
          <button type="button" className="btn" onClick={() => setRevealed(true)} disabled={guessCount === 0}>
            {guessCount === 0 ? 'Make a guess first' : `Check my ${guessCount} guess${guessCount === 1 ? '' : 'es'}`}
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => switchMode(mode === 'careless' ? 'careful' : 'careless')}>
            {mode === 'careless' ? 'Now try careful habits' : 'Try careless habits again'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => switchMode(mode)}>Reset</button>
        <span className="muted small">Demo data</span>
      </div>
    </div>
  );
}
