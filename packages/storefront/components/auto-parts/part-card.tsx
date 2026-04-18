'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Part } from '@/types/parts';

interface PartCardProps {
  part: Part;
  variant?: 'compact' | 'detailed';
  onAddToCart?: (part: Part) => void;
  className?: string;
}

const cardVariants = {
  compact: 'flex-row items-center p-3 gap-3',
  detailed: 'flex-col items-stretch p-4 gap-4',
};

const imageVariants = {
  compact: 'w-16 h-16 rounded-md flex-shrink-0',
  detailed: 'w-full aspect-square rounded-lg',
};

export function PartCard({ part, variant = 'detailed', onAddToCart, className }: PartCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
    setIsAdded(true);
    onAddToCart?.(part);
    setTimeout(() => setIsAdded(false), 2000);
  }, [part, onAddToCart]);

  const hasDiscount = part.originalPrice && part.originalPrice > part.price;
  const discountPercent = hasDiscount
    ? Math.round(((part.originalPrice! - part.price) / part.originalPrice!) * 100)
    : 0;

  const stockBadge =
    part.stock === 'in'
      ? { label: 'В наличии', variant: 'success' as const }
      : part.stock === 'order'
        ? { label: 'Под заказ', variant: 'warning' as const }
        : { label: 'Нет в наличии', variant: 'error' as const };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-l-3 hover:border-l-primary cursor-pointer',
        variant === 'compact' && 'hover:border-l-[3px]',
        className,
      )}
    >
      <div className={cn('flex', cardVariants[variant])}>
        <div
          className={cn(
            'bg-gray-50 flex items-center justify-center overflow-hidden',
            imageVariants[variant],
          )}
        >
          <img
            src={part.images?.[0] || '/placeholder-part.png'}
            alt={part.name}
            className="object-contain w-full h-full"
          />
        </div>

        <div className={cn('flex-1', variant === 'compact' ? 'min-w-0' : 'space-y-3')}>
          <div className="flex items-start justify-between gap-2">
            <div className={cn('min-w-0', variant === 'compact' && 'flex-1')}>
              <p className="text-xs text-gray-500">{part.brand}</p>
              <p
                className={cn(
                  'font-medium text-gray-900',
                  variant === 'compact' ? 'text-sm truncate' : 'text-base',
                )}
              >
                {part.name}
              </p>
              <p className="text-xs text-gray-400 font-mono">{part.partNumber}</p>
            </div>
            {hasDiscount && variant === 'detailed' && (
              <Badge variant="error" className="flex-shrink-0">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {variant === 'detailed' && part.crossReferences && part.crossReferences.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {part.crossReferences.slice(0, 3).map((cr) => (
                <Badge key={cr.id} variant="outline" className="text-[10px]">
                  {cr.targetBrand} {cr.targetNumber}
                </Badge>
              ))}
              {part.crossReferences.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{part.crossReferences.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">{part.price.toFixed(2)} ₼</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {part.originalPrice!.toFixed(2)} ₼
                </span>
              )}
            </div>
            <Badge variant={stockBadge.variant} dot>
              {stockBadge.label}
            </Badge>
          </div>
        </div>

        {variant === 'compact' && (
          <Button
            size="sm"
            variant={isAdded ? 'primary' : 'secondary'}
            onClick={handleAddToCart}
            disabled={isAdding || part.stock === 'out'}
            className="flex-shrink-0"
          >
            {isAdded ? '✓' : isAdding ? '...' : 'В корзину'}
          </Button>
        )}
      </div>

      {variant === 'detailed' && (
        <div className="pt-3 border-t border-gray-100 mt-3">
          <Button
            className="w-full"
            variant={isAdded ? 'primary' : 'secondary'}
            onClick={handleAddToCart}
            disabled={isAdding || part.stock === 'out'}
          >
            {isAdded ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                В корзине
              </span>
            ) : isAdding ? (
              'Добавляем...'
            ) : (
              'В корзину'
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

interface PartCardSkeletonProps {
  variant?: 'compact' | 'detailed';
}

export function PartCardSkeleton({ variant = 'detailed' }: PartCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-100 p-4 space-y-4 animate-pulse',
        variant === 'compact' && 'flex-row p-3 gap-3',
      )}
    >
      <div
        className={cn(
          'bg-gray-200 rounded-md',
          variant === 'compact' ? 'w-16 h-16' : 'w-full aspect-square',
        )}
      />
      <div className={cn('flex-1 space-y-3', variant === 'compact' && 'flex-1')}>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
      {variant === 'detailed' && <div className="h-10 bg-gray-200 rounded-md w-full" />}
    </div>
  );
}

interface PartCardEmptyProps {
  message?: string;
}

export function PartCardEmpty({ message = 'Запчасти не найдены' }: PartCardEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
    </div>
  );
}

interface PartCardErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PartCardError({ message = 'Ошибка загрузки', onRetry }: PartCardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 rounded-lg border border-red-100">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm text-red-600 hover:underline">
          Попробовать снова
        </button>
      )}
    </div>
  );
}
