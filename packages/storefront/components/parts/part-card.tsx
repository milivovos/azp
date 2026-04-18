'use client';

import Image from 'next/image';
import { useOptimistic, useTransition } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Part } from '@/types/parts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/components/currency/currency-provider';

const shell = cva(
  'group relative flex w-full overflow-hidden rounded-lg border border-gray-100 bg-white text-left shadow-sm transition-[transform,border-color,box-shadow] duration-base ease-motion-base focus-within:ring-2 focus-within:ring-primary/50',
  {
    variants: {
      layout: {
        compact: 'flex-row items-center gap-ds-3 p-ds-3',
        detailed: 'flex-col gap-ds-3 p-ds-4',
      },
      interactive: {
        true: 'hover:-translate-y-1 hover:border-l-[3px] hover:border-l-primary hover:shadow-md',
        false: '',
      },
    },
    defaultVariants: {
      layout: 'detailed',
      interactive: true,
    },
  },
);

export type PartCardProps = {
  part?: Part | null;
  className?: string;
  layout?: VariantProps<typeof shell>['layout'];
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  onAddToCart?: (part: Part) => Promise<void> | void;
};

export function PartCard({
  part,
  className,
  layout = 'detailed',
  loading,
  empty,
  error,
  onAddToCart,
}: PartCardProps) {
  const { formatPrice } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [optimisticAdding, setOptimisticAdding] = useOptimistic(
    false,
    (_current, next: boolean) => next,
  );

  if (loading) {
    return (
      <div
        className={cn(
          shell({ layout, interactive: false }),
          layout === 'compact' ? '' : 'min-h-[200px]',
          className,
        )}
        aria-busy="true"
      >
        {layout === 'detailed' && <Skeleton className="h-40 w-full max-sm:h-24 max-sm:w-28" />}
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          shell({ layout, interactive: false }),
          'items-center justify-center py-ds-7 text-center text-sm text-gray-500',
          className,
        )}
      >
        Нет позиций для отображения
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          shell({ layout, interactive: false }),
          'border-amber-200 bg-amber-50/60 p-ds-4 text-sm text-amber-900',
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (!part) {
    return null;
  }

  const img = part.images[0];
  const stockLabel =
    part.stock === 'in' ? 'В наличии' : part.stock === 'order' ? 'Под заказ' : 'Нет в наличии';

  const meta = (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-ds-2', layout === 'compact' && 'pr-ds-2')}>
      <div className="flex flex-wrap gap-ds-2">
        <Badge variant="outline">{part.brand}</Badge>
        <Badge variant="primary" dot>
          Оригинал
        </Badge>
        <Badge variant="warning">Хит продаж</Badge>
        <Badge variant="success">−15%</Badge>
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-500">{part.sku}</p>
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{part.name}</p>
      </div>
      <div className="flex flex-wrap items-center gap-ds-3 text-sm">
        <span className="text-base font-bold text-gray-900">
          {formatPrice(part.price, part.currency ?? 'EUR')}
        </span>
        <span className="text-xs text-gray-500">{stockLabel}</span>
      </div>
    </div>
  );

  const cartBtn = (
    <Button
      type="button"
      className={cn(layout === 'detailed' && 'w-full', layout === 'compact' && 'max-sm:w-full')}
      disabled={part.stock === 'out' || isPending}
      isLoading={isPending}
      onClick={() => {
        if (!onAddToCart) return;
        startTransition(async () => {
          setOptimisticAdding(true);
          await onAddToCart(part);
        });
      }}
    >
      {optimisticAdding ? 'Добавляем…' : 'В корзину'}
    </Button>
  );

  if (layout === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(shell({ layout }), className)}
      >
        {img && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-50 sm:h-16 sm:w-16">
            <Image src={img} alt="" fill className="object-cover" sizes="64px" />
          </div>
        )}
        {meta}
        {cartBtn}
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(shell({ layout }), className)}
    >
      <div className="flex w-full flex-col gap-ds-3 sm:flex-col">
        <div className="flex flex-row gap-ds-3 sm:flex-col">
          {img && (
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-md bg-gray-50 sm:aspect-[4/3] sm:h-auto sm:w-full">
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 320px"
              />
            </div>
          )}
          {meta}
        </div>
        {cartBtn}
      </div>
    </motion.article>
  );
}
