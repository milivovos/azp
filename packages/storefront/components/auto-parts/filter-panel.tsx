'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Category, Brand, PartFilter } from '@/types/parts';

interface FacetedFilterPanelProps {
  filters: PartFilter;
  onFiltersChange: (filters: PartFilter) => void;
  categories?: Category[];
  brands?: Brand[];
  className?: string;
}

export function FacetedFilterPanel({
  filters,
  onFiltersChange,
  categories = [],
  brands = [],
  className,
}: FacetedFilterPanelProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ? [filters.category] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    filters.brand ? [filters.brand] : [],
  );
  const [priceRange, setPriceRange] = useState<[number, number] | null>(
    filters.priceMin && filters.priceMax ? [filters.priceMin, filters.priceMax] : null,
  );
  const [inStockOnly, setInStockOnly] = useState(filters.inStock || false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const brand = params.get('brand');
    const priceMin = params.get('priceMin');
    const priceMax = params.get('priceMax');
    const inStock = params.get('inStock');

    if (category) setSelectedCategories([category]);
    if (brand) setSelectedBrands([brand]);
    if (priceMin && priceMax) setPriceRange([parseInt(priceMin), parseInt(priceMax)]);
    if (inStock === 'true') setInStockOnly(true);
  }, []);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCategories[0]) params.set('category', selectedCategories[0]);
    if (selectedBrands[0]) params.set('brand', selectedBrands[0]);
    if (priceRange) {
      params.set('priceMin', priceRange[0].toString());
      params.set('priceMax', priceRange[1].toString());
    }
    if (inStockOnly) params.set('inStock', 'true');

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }, [selectedCategories, selectedBrands, priceRange, inStockOnly]);

  const applyFilters = useCallback(() => {
    const newFilters: PartFilter = {
      ...filters,
      category: selectedCategories[0],
      brand: selectedBrands[0],
      priceMin: priceRange?.[0],
      priceMax: priceRange?.[1],
      inStock: inStockOnly || undefined,
    };
    onFiltersChange(newFilters);
    updateURL();
    setIsMobileOpen(false);
  }, [
    filters,
    selectedCategories,
    selectedBrands,
    priceRange,
    inStockOnly,
    onFiltersChange,
    updateURL,
  ]);

  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(null);
    setInStockOnly(false);
    onFiltersChange({});
    setIsMobileOpen(false);
  }, [onFiltersChange]);

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceRange ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Категории</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category.name}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([category.name]);
                  } else {
                    setSelectedCategories([]);
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 flex-1">{category.name}</span>
              <Badge variant="outline" className="text-xs">
                {category.count}
              </Badge>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Бренды</h3>
        <Input placeholder="Поиск бренда..." className="mb-3" />
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.slice(0, 10).map((brand) => (
            <label
              key={brand.name}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBrands([brand.name]);
                  } else {
                    setSelectedBrands([]);
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
              <Badge variant="outline" className="text-xs">
                {brand.count}
              </Badge>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Цена, ₼</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="От"
            value={priceRange?.[0] || ''}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange?.[1] || 0])}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="До"
            value={priceRange?.[1] || ''}
            onChange={(e) => setPriceRange([priceRange?.[0] || 0, parseInt(e.target.value) || 0])}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Только в наличии</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button variant="outline" className="flex-1" onClick={resetFilters}>
          Сбросить
        </Button>
        <Button variant="primary" className="flex-1" onClick={applyFilters}>
          Применить
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button variant="outline" className="lg:hidden gap-2" onClick={() => setIsMobileOpen(true)}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Фильтры
        {activeFiltersCount > 0 && (
          <Badge variant="primary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      <div className={cn('hidden lg:block', className)}>
        <div className="sticky top-24">
          <FilterContent />
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Фильтры</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)}>
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
