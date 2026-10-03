const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj'
];

/**
 * Formats large idle numbers into compact, readable strings.
 * e.g., 950 -> "$950", 12500 -> "$12.5K", 1500000 -> "$1.50M"
 */
export function formatCash(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  if (amount < 0) return `-$${formatNumber(Math.abs(amount))}`;
  return `$${formatNumber(amount)}`;
}

export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  if (amount < 1000) {
    return Math.floor(amount).toLocaleString();
  }

  const exp = Math.floor(Math.log10(amount) / 3);
  if (exp >= SUFFIXES.length) {
    return amount.toExponential(2);
  }

  const scaled = amount / Math.pow(10, exp * 3);
  return `${scaled.toFixed(scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2)}${SUFFIXES[exp]}`;
}

/**
 * Formats time remaining in seconds to MM:SS or HH:MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
