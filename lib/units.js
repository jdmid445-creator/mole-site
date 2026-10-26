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

export function fromUnits(units, decimals, maxFraction = decimals) {
  // Full precision by default: these are amounts people are told to send, so they must never be rounded down.

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

// "Round numbers blend in": round = at most 2 significant digits (0.05, 0.25, 1.5, 12, 150).
function sigDigits(v) {
  const digits = v.replace('-', '').replace('.', '').replace(/^0+/, '').replace(/0+$/, '');
  return digits.length;
}

export function looksRound(value) {
  const v = String(value ?? '').trim();
  if (!v || !Number(v)) return true;
  return sigDigits(v) <= 2;
}

// A nearby round amount of the same size (1.237 -> 1.2, 0.0537 -> 0.054, 23.46 -> 23).
export function suggestRound(value) {
  const n = Number(value);
  if (!n) return '';
  return String(Number(n.toPrecision(2)));
}
