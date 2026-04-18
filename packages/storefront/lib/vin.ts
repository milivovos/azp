const VIN_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;

const TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
};

/** SAE J272 / ISO 3779 weights; index 8 (9th char) has weight 0 */
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function stripVinMask(formatted: string): string {
  return formatted.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
}

export function formatVinMask(raw: string): string {
  const v = stripVinMask(raw).slice(0, 17);
  const parts = [v.slice(0, 4), v.slice(4, 8), v.slice(8, 12), v.slice(12, 17)].filter(Boolean);
  return parts.join('-');
}

export function validateVinIso3779(vin: string): boolean {
  const v = stripVinMask(vin);
  if (!VIN_CHARS.test(v)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const ch = v[i]!;
    const val = TRANSLITERATION[ch];
    if (val === undefined) return false;
    sum += val * WEIGHTS[i]!;
  }

  const mod = sum % 11;
  const expected = mod === 10 ? 'X' : String(mod);
  return v[8] === expected;
}

export function vinCharsetErrorIndex(vin: string): number | null {
  const v = stripVinMask(vin);
  for (let i = 0; i < v.length; i++) {
    const ch = v[i]!;
    if (TRANSLITERATION[ch] === undefined) return i;
  }
  return null;
}
