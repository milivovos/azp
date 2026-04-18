'use client';

import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CrossReferenceRow } from '@/types/parts';
import { sortCrossReferencesByRelevance } from '@/lib/relevance';
import { cn } from '@/lib/utils';

export type CrossReferencesBlockProps = {
  rows: CrossReferenceRow[];
  className?: string;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
};

export function CrossReferencesBlock({
  rows,
  className,
  loading,
  empty,
  error,
}: CrossReferencesBlockProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => sortCrossReferencesByRelevance(rows), [rows]);

  const rowVirtualizer = useVirtualizer({
    count: loading || empty || error ? 0 : sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

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
        Аналоги не найдены
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-100 bg-white shadow-sm', className)}>
      <div className="border-b border-gray-100 px-ds-4 py-ds-3 text-sm font-semibold text-gray-900">
        Аналоги и замены
      </div>
      <div ref={parentRef} className="h-[min(420px,55vh)] overflow-auto">
        {loading && (
          <div className="space-y-2 p-ds-3" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        )}
        {!loading && (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = sorted[virtualRow.index]!;
              const full = (row.compatibility ?? 0) >= 0.999;
              return (
                <div
                  key={row.id}
                  className="absolute left-0 right-0 flex items-center gap-ds-3 border-b border-gray-50 px-ds-4 py-2 text-sm"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-24 shrink-0 font-mono text-xs text-gray-600">{row.sku}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-gray-900">{row.brand}</div>
                    <div className="truncate text-xs text-gray-500">{row.name}</div>
                  </div>
                  <div className="w-20 shrink-0 text-right font-semibold">
                    {row.price.toLocaleString('ru-RU')} RUB
                  </div>
                  <div className="w-16 shrink-0 text-right text-xs text-gray-500">
                    {row.leadDays} дн.
                  </div>
                  <div className="flex w-10 shrink-0 justify-end">
                    <span
                      className={cn(
                        'inline-block h-2.5 w-2.5 rounded-full',
                        full ? 'bg-emerald-500' : 'bg-gray-200',
                      )}
                      title={
                        full
                          ? '100% совместимость'
                          : `Совместимость ${Math.round((row.compatibility ?? 0) * 100)}%`
                      }
                      aria-label={
                        full
                          ? 'Полная совместимость'
                          : `Совместимость ${Math.round((row.compatibility ?? 0) * 100)} процентов`
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
