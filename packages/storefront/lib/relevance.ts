import type { CrossReferenceRow } from '@/types/parts';

function normLowerBetter(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  if (max === min) return 1;
  const t = (value - min) / (max - min);
  return Math.min(1, Math.max(0, 1 - t));
}

function normHigherBetter(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  if (max === min) return 1;
  const t = (value - min) / (max - min);
  return Math.min(1, Math.max(0, t));
}

export function scoreCrossReference(row: CrossReferenceRow, stats: CrossRefStats): number {
  const priceS = normLowerBetter(row.price, stats.minPrice, stats.maxPrice);
  const leadS = normLowerBetter(row.leadDays, stats.minLead, stats.maxLead);
  const ratingS = normHigherBetter(row.rating, stats.minRating, stats.maxRating);
  return 0.6 * priceS + 0.3 * leadS + 0.1 * ratingS;
}

export type CrossRefStats = {
  minPrice: number;
  maxPrice: number;
  minLead: number;
  maxLead: number;
  minRating: number;
  maxRating: number;
};

export function crossRefStats(rows: CrossReferenceRow[]): CrossRefStats {
  const prices = rows.map((r) => r.price);
  const leads = rows.map((r) => r.leadDays);
  const ratings = rows.map((r) => r.rating);
  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minLead: Math.min(...leads),
    maxLead: Math.max(...leads),
    minRating: Math.min(...ratings),
    maxRating: Math.max(...ratings),
  };
}

export function sortCrossReferencesByRelevance(rows: CrossReferenceRow[]): CrossReferenceRow[] {
  if (rows.length === 0) return [];
  const stats = crossRefStats(rows);
  return [...rows].sort((a, b) => scoreCrossReference(b, stats) - scoreCrossReference(a, stats));
}
