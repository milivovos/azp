'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SupplierOffer } from '@/types/parts';

function getDeliveryIcon(type?: 'stock' | 'transit' | 'order') {
  switch (type) {
    case 'stock':
      return '📦';
    case 'transit':
      return '🚚';
    case 'order':
      return '🕐';
  }
}

function getDeliveryLabel(type?: 'stock' | 'transit' | 'order', days?: number) {
  const d = days ?? 0;
  if (type === 'stock' && d <= 1) return '1 день';
  if (type === 'transit') return `${d}-${d + 2} дней`;
  return 'Под заказ';
}

interface SupplierComparisonTableProps {
  offers: SupplierOffer[];
  onSelectOffer?: (offer: SupplierOffer) => void;
  className?: string;
}

export function SupplierComparisonTable({
  offers,
  onSelectOffer,
  className,
}: SupplierComparisonTableProps) {
  const bestOffer = useMemo(() => {
    if (!offers || offers.length === 0) return null;
    let best = offers[0]!;
    for (const offer of offers) {
      const score = offer.price * 0.6 + (offer.deliveryTime ?? 0) * 0.3;
      const bestScore = best.price * 0.6 + (best.deliveryTime ?? 0) * 0.3;
      if (score < bestScore) {
        best = offer;
      }
    }
    return best;
  }, [offers]);

  if (!offers || offers.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-100 overflow-hidden', className)}>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-100 p-6 text-center', className)}>
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p className="text-gray-500">Нет предложений от поставщиков</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-100 overflow-hidden', className)}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Сравнение поставщиков ({offers.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Поставщик
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Цена
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Срок доставки
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Гарантия
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Наличие
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                Действие
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((offer) => {
              const isBest = bestOffer?.supplierId === offer.supplierId;

              return (
                <motion.tr
                  key={offer.supplierId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn('hover:bg-gray-50 transition-colors', isBest && 'bg-primary-light')}
                  style={isBest ? { borderLeft: '3px solid #FF7A3D' } : undefined}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isBest && (
                        <Badge variant="primary" dot className="text-[10px]">
                          Лучшее
                        </Badge>
                      )}
                      <span className="font-medium text-gray-900">{offer.supplierName}</span>
                    </div>
                    {offer.isOriginal && (
                      <Badge variant="success" className="mt-1 text-[10px]">
                        Оригинал
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn('text-lg font-bold', isBest ? 'text-primary' : 'text-gray-900')}
                    >
                      {offer.price.toFixed(2)} ₼
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{getDeliveryIcon(offer.deliveryType)}</span>
                      <span className="text-sm text-gray-600">
                        {getDeliveryLabel(offer.deliveryType, offer.deliveryTime)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{offer.warranty} мес.</span>
                  </td>
                  <td className="px-4 py-3">
                    {offer.inStock ? (
                      <Badge variant="success" dot>
                        В наличии ({offer.quantity})
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        {(offer.quantity ?? 0) > 0 ? 'Ограничено' : 'Нет'}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={isBest ? 'primary' : 'secondary'}
                      onClick={() => onSelectOffer?.(offer)}
                    >
                      {isBest ? 'Выбрать' : 'Выбрать'}
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span>📦</span>В наличии (1 день)
          </span>
          <span className="flex items-center gap-1">
            <span>🚚</span>В пути (3-5 дней)
          </span>
          <span className="flex items-center gap-1">
            <span>🕐</span>
            Под заказ
          </span>
        </div>
      </div>
    </div>
  );
}
