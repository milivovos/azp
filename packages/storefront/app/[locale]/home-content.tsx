'use client';

import { AzPartsHome } from '@/components/home/az-parts-home';
import type { ProductWithImages } from '@/lib/product-to-part';

interface HomeContentProps {
  products: ProductWithImages[];
  categories: any[];
}

export function HomeContent({ products, categories }: HomeContentProps) {
  return <AzPartsHome products={products} categories={categories} />;
}
