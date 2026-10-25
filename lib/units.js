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

// "Round numbers blend in": true when the amount has at most 1 significant decimal.
export function looksRound(value) {
  const v = String(value ?? '').trim();
  if (!v) return true;
  const frac = v.split('.')[1] || '';
  return frac.replace(/0+$/, '').length <= 1;
}
