'use client';

import type { SupplierOffer } from '@/types/parts';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/currency/currency-provider';

const ICON = {
  truck: String.fromCodePoint(0x1f69a),
  box: String.fromCodePoint(0x1f4e6),
  clock: String.fromCodePoint(0x1f550),
} as const;

function leadIcon(offer: SupplierOffer): { emoji: string; label: string } {
  if (!offer.inStock) return { emoji: ICON.clock, label: 'Под заказ' };
  if (offer.leadDaysMax != null && offer.leadDaysMax <= 1)
    return { emoji: ICON.truck, label: '1 день' };
  if (offer.leadDaysMax != null && offer.leadDaysMax <= 5)
    return { emoji: ICON.box, label: '3–5 дней' };
  return { emoji: ICON.clock, label: 'Под заказ' };
}

function pickBest(offers: SupplierOffer[]): string | null {
  const candidates = offers.filter((o) => o.inStock);
  const pool = candidates.length ? candidates : offers;
  if (pool.length === 0) return null;
  const best = pool.reduce((a, b) => (b.price < a.price ? b : a));
  return best.id ?? null;
}

export type SupplierComparisonTableProps = {
  offers: SupplierOffer[];
  className?: string;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  /** Валюта цен (минимальные единицы, как в API). */
  currency?: string;
};

/** Оборачивайте в `<Suspense>` на странице для streaming при асинхронной загрузке данных. */
export function SupplierComparisonTable({
  offers,
  className,
  loading,
  empty,
  error,
  currency = 'EUR',
}: SupplierComparisonTableProps) {
  const { formatPrice } = useCurrency();
  const bestId = !loading && !empty && !error ? pickBest(offers) : null;

  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-amber-50/60 p-ds-4 text-sm text-amber-900',
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (!loading && empty) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-100 bg-white p-ds-6 text-center text-sm text-gray-500',
          className,
        )}
      >
        Нет предложений поставщиков
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm',
        className,
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-ds-4 py-ds-3">Поставщик</th>
            <th className="px-ds-4 py-ds-3">Цена</th>
            <th className="px-ds-4 py-ds-3">Срок</th>
            <th className="px-ds-4 py-ds-3">Рейтинг</th>
            <th className="px-ds-4 py-ds-3">Наличие</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50" aria-busy="true">
                <td className="px-ds-4 py-ds-3" colSpan={5}>
                  <div className="h-10 animate-pulse rounded-md bg-gray-100" />
                </td>
              </tr>
            ))}
          {!loading &&
            offers.map((o) => {
              const { emoji, label } = leadIcon(o);
              const best = o.id === bestId;
              return (
                <tr
                  key={o.id}
                  className={cn(
                    'border-b border-gray-50 last:border-0',
                    best && 'bg-primary-light ring-1 ring-inset ring-primary',
                  )}
                >
                  <td className="px-ds-4 py-ds-3 font-medium text-gray-900">{o.supplierName}</td>
                  <td className="px-ds-4 py-ds-3 font-semibold">
                    {formatPrice(o.price, currency)}
                  </td>
                  <td className="px-ds-4 py-ds-3">
                    <span role="img" aria-label={label} className="mr-2">
                      {emoji}
                    </span>
                    <span className="text-gray-600">{label}</span>
                  </td>
                  <td className="px-ds-4 py-ds-3 text-gray-700">{(o.rating ?? 0).toFixed(1)}</td>
                  <td className="px-ds-4 py-ds-3 text-gray-700">
                    {o.inStock ? 'Да' : 'Уточняйте'}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
