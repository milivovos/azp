import type { Product } from '@forkcart/shared';
import type { Part } from '@/types/parts';

export type ProductWithImages = Product & {
  images?: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
};

/** Цена в центах/копейках как в API; `brand` из metadata при необходимости. */
export function productToPart(product: ProductWithImages): Part {
  const images = product.images?.sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url) ?? [];
  const meta = product.metadata as Record<string, unknown> | null | undefined;
  const brand =
    (typeof meta?.['brand'] === 'string' && meta['brand']) ||
    (typeof meta?.['manufacturer'] === 'string' && meta['manufacturer']) ||
    'OEM';

  let stock: Part['stock'] = 'order';
  if (!product.trackInventory) stock = 'in';
  else if (product.inventoryQuantity > 0) stock = 'in';
  else stock = 'order';

  return {
    id: product.id,
    sku: product.sku || product.slug,
    brand,
    name: product.name,
    price: product.price,
    stock,
    compatibles: [],
    images,
    currency: product.currency,
  };
}
