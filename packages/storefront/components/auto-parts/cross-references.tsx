'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/skeleton';
import type { CrossReferenceRow } from '@/types/parts';

type SortField = 'price' | 'delivery' | 'relevance';

interface CrossReferencesBlockProps {
  brand: string;
  partNumber: string;
  initialCrossReferences?: CrossReferenceRow[];
  onSelectCross?: (cross: CrossReferenceRow) => void;
  className?: string;
}

export function CrossReferencesBlock({
  brand,
  partNumber,
  initialCrossReferences = [],
  onSelectCross,
  className,
}: CrossReferencesBlockProps) {
  const [sortField, setSortField] = useState<SortField>('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [crossReferences, setCrossReferences] =
    useState<CrossReferenceRow[]>(initialCrossReferences);

  useEffect(() => {
    if (initialCrossReferences.length > 0) return;

    setIsLoading(true);
    fetch(
      `http://localhost:4000/api/v1/auto-parts/crosses/${encodeURIComponent(brand)}/${encodeURIComponent(partNumber)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setCrossReferences(data.data || []);
      })
      .finally(() => setIsLoading(false));
  }, [brand, partNumber, initialCrossReferences.length]);

  const sortedCrossReferences = useMemo(() => {
    if (sortField === 'relevance') {
      return [...crossReferences].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
    return crossReferences;
  }, [crossReferences, sortField]);

  const getConfidenceColor = (confidence?: number) => {
    const c = confidence || 0;
    if (c >= 95) return 'text-green-600';
    if (c >= 80) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getConfidenceLabel = (confidence?: number) => {
    const c = confidence || 0;
    if (c >= 95) return 'Точное совпадение';
    if (c >= 80) return 'Высокая совместимость';
    return 'Возможная совместимость';
  };

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border border-gray-100 overflow-hidden', className)}>
        <div className="p-4 border-b border-gray-100">
          <SkeletonTable cols={4} rows={5} />
        </div>
      </div>
    );
  }

  if (crossReferences.length === 0) {
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <p className="text-gray-500">Аналоги не найдены</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-100 overflow-hidden', className)}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Аналоги и кроссы ({crossReferences.length})</h3>
        <div className="flex gap-2">
          {(['relevance', 'price', 'delivery'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => setSortField(field)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                sortField === field
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {field === 'relevance' && 'По релевантности'}
              {field === 'price' && 'По цене'}
              {field === 'delivery' && 'По сроку'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Бренд
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Артикул
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Наименование
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Совместимость
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                Действие
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCrossReferences.map((cross: CrossReferenceRow) => (
              <motion.tr
                key={cross.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  cross.confidence === 100 && 'bg-green-50/50',
                )}
              >
                <td className="px-4 py-3">
                  <Badge variant={cross.source === 'tecdoc' ? 'primary' : 'default'}>
                    {cross.targetBrand}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-900">{cross.targetNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{cross.targetName || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {cross.confidence === 100 && (
                      <span
                        className="w-2 h-2 bg-green-500 rounded-full"
                        title="Точное совпадение"
                      />
                    )}
                    <span className={cn('text-sm', getConfidenceColor(cross.confidence))}>
                      {cross.confidence ?? '-'}%
                    </span>
                    {(cross.confidence ?? 0) >= 95 && (
                      <span className="text-xs text-green-600">
                        ({getConfidenceLabel(cross.confidence)})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => onSelectCross?.(cross)}>
                    Выбрать
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Точное совпадение (100%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            Высокая совместимость (80-94%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Возможная совместимость (&lt;80%)
          </span>
        </div>
      </div>
    </div>
  );
}
