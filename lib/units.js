// Convert between human amounts ("1.5") and integer base units ("1500000000").

export function toUnits(value, decimals) {
  const v = String(value ?? '').trim();
  if (!v || v === '.' || !/^\d*\.?\d*$/.test(v)) throw new Error('Enter a valid amount');
  const [whole, frac = ''] = v.split('.');
  if (frac.length > decimals) throw new Error(`Use at most ${decimals} decimal places`);
  const units = BigInt((whole || '0') + frac.padEnd(decimals, '0')).toString();
  if (units === '0') throw new Error('Amount must be greater than zero');
  return units;
}

export function fromUnits(units, decimals, maxFraction = 6) {
  try {
    const n = BigInt(String(units));
    const base = 10n ** BigInt(decimals);
    const whole = n / base;
    let frac = (n % base).toString().padStart(decimals, '0').slice(0, maxFraction);
    frac = frac.replace(/0+$/, '');
    return frac ? `${whole}.${frac}` : `${whole}`;
  } catch {
    return String(units ?? '');
  }
}

// Short, readable display for amounts like "0.004323769552122945" → "0.0043238".
export function displayAmount(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const text = n >= 1 ? n.toFixed(4) : n.toPrecision(5);
  return String(Number(text));
}

// "Round numbers blend in": true when the amount has at most 1 significant decimal.
export function looksRound(value) {
  const v = String(value ?? '').trim();
  if (!v) return true;
  const frac = v.split('.')[1] || '';
  return frac.replace(/0+$/, '').length <= 1;
}
