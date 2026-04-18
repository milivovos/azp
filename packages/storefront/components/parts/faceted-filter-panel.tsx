'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const STOCK = ['all', 'in', 'order', 'out'] as const;

const filterParsers = {
  brands: parseAsArrayOf(parseAsString).withDefault([]),
  stock: parseAsStringLiteral(STOCK).withDefault('all'),
};

export type FacetedFilterPanelProps = {
  className?: string;
  facetBrands?: string[];
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
};

export function FacetedFilterPanel({
  className,
  facetBrands = ['HYUNDAI', 'KIA', 'MOBIS', 'BOSCH'],
  loading,
  empty,
  error,
}: FacetedFilterPanelProps) {
  const [params, setParams] = useQueryStates(filterParsers, { history: 'replace' });
  const [sheetOpen, setSheetOpen] = useState(false);

  const selected = useMemo(() => new Set(params.brands), [params.brands]);

  const toggleBrand = (b: string) => {
    const next = new Set(selected);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    setParams({ brands: [...next] });
  };

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

  if (empty) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-100 bg-white p-ds-6 text-center text-sm text-gray-500',
          className,
        )}
      >
        Нет доступных фильтров
      </div>
    );
  }

  const panelInner = (
    <div className="space-y-ds-5">
      <section>
        <h3 className="mb-ds-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Бренд
        </h3>
        {loading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-ds-2">
            {facetBrands.map((b) => {
              const on = selected.has(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  className={cn(
                    'flex min-h-[44px] items-center justify-between rounded-md border px-ds-3 text-left text-sm transition-colors duration-base ease-motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    on
                      ? 'border-primary bg-primary-light font-medium text-gray-900'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300',
                  )}
                >
                  {b}
                  <span className="text-xs text-gray-400" aria-hidden>
                    {on ? '\u2713' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-ds-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Наличие
        </h3>
        <div className="grid grid-cols-2 gap-ds-2" role="group" aria-label="Фильтр по наличию">
          {(
            [
              ['all', 'Все'],
              ['in', 'В наличии'],
              ['order', 'Под заказ'],
              ['out', 'Нет'],
            ] as const
          ).map(([key, label]) => {
            const on = params.stock === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setParams({ stock: key })}
                className={cn(
                  'min-h-[44px] rounded-md border px-ds-2 text-sm transition-colors duration-base ease-motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  on
                    ? 'border-primary bg-primary-light font-medium'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setParams({ brands: [], stock: 'all' })}
      >
        Сбросить
      </Button>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden w-72 shrink-0 rounded-xl border border-gray-100 bg-white p-ds-4 shadow-sm md:block',
          className,
        )}
      >
        {panelInner}
      </aside>

      <div className="md:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Фильтры
        </Button>
        <AnimatePresence>
          {sheetOpen && (
            <motion.div
              className="fixed inset-0 z-modal bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="presentation"
              onMouseDown={() => setSheetOpen(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Фильтры"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-xl border-t border-gray-100 bg-white p-ds-4 shadow-lg"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="mb-ds-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Фильтры</span>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label="Закрыть"
                    onClick={() => setSheetOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {panelInner}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
