'use server';

import type { UniversalSearchHit } from '@/types/parts';

export type UniversalSearchResult = {
  articles: UniversalSearchHit[];
  vehicles: UniversalSearchHit[];
  vins: UniversalSearchHit[];
};

const MOCK_ARTICLES: UniversalSearchHit[] = [
  { id: 'a1', label: 'HYUNDAI 58101-3M000', sublabel: 'Бампер передний', group: 'articles' },
  { id: 'a2', label: 'MOBIS 26300-3CAA0', sublabel: 'Фильтр масляный', group: 'articles' },
];

const MOCK_VEHICLES: UniversalSearchHit[] = [
  { id: 'v1', label: 'HYUNDAI Genesis', sublabel: '2008–2016', group: 'vehicles' },
  { id: 'v2', label: 'KIA Stinger', sublabel: '2017–2022', group: 'vehicles' },
];

const MOCK_VINS: UniversalSearchHit[] = [
  { id: 'vin1', label: 'KMHGH4JH2EU123456', sublabel: 'Genesis · 3.3 GDI', group: 'vins' },
];

function match(hits: UniversalSearchHit[], q: string): UniversalSearchHit[] {
  const s = q.toLowerCase();
  return hits.filter(
    (h) => h.label.toLowerCase().includes(s) || h.sublabel?.toLowerCase().includes(s),
  );
}

export async function universalSearchAction(query: string): Promise<UniversalSearchResult> {
  const q = query.trim();
  if (!q) {
    return { articles: [], vehicles: [], vins: [] };
  }

  return {
    articles: match(MOCK_ARTICLES, q),
    vehicles: match(MOCK_VEHICLES, q),
    vins: match(MOCK_VINS, q),
  };
}
