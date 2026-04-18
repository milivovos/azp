'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UniversalSearchBar,
  VehicleSelector,
  VinDecoderInput,
  PartCard,
  PartCardSkeleton,
  PartCardEmpty,
  CrossReferencesBlock,
  SupplierComparisonTable,
  FacetedFilterPanel,
} from '@/components';
import type { Part, Category, Brand, PartFilter, SupplierOffer } from '@/types/parts';

function PartsGrid({ parts, isLoading }: { parts: Part[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PartCardSkeleton key={i} variant="detailed" />
        ))}
      </div>
    );
  }

  if (parts.length === 0) {
    return <PartCardEmpty message="Запчасти не найдены. Попробуйте изменить параметры поиска." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parts.map((part, index) => (
        <motion.div
          key={part.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PartCard part={part} variant="detailed" />
        </motion.div>
      ))}
    </div>
  );
}

function FiltersPanel({
  filters,
  onChange,
  categories,
  brands,
}: {
  filters: PartFilter;
  onChange: (f: PartFilter) => void;
  categories: Category[];
  brands: Brand[];
}) {
  return (
    <FacetedFilterPanel
      filters={filters}
      onFiltersChange={onChange}
      categories={categories}
      brands={brands}
      className="w-64"
    />
  );
}

export default function ClientAutoPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PartFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showVinDecoder, setShowVinDecoder] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.inStock) params.set('inStock', 'true');

    fetch(`http://localhost:4000/api/v1/auto-parts/search?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setParts(data.data || []);
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery, filters]);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/auto-parts/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));

    fetch('http://localhost:4000/api/v1/auto-parts/brands')
      .then((res) => res.json())
      .then((data) => setBrands(data.data || []));
  }, []);

  const handleSearch = useCallback((query: string, _type: string) => {
    setSearchQuery(query);
  }, []);

  const handlePartSelect = useCallback((part: Part) => {
    setSelectedPart(part);
    setSearchQuery('');
  }, []);

  const handleVehicleSelect = useCallback((_vehicle: any) => {
    setSearchQuery('');
  }, []);

  const handleVinDecode = useCallback((result: any) => {
    setSearchQuery(result.vin);
    setShowVinDecoder(false);
  }, []);

  const handleFiltersChange = useCallback((newFilters: PartFilter) => {
    setFilters(newFilters);
  }, []);

  const mockOffers: SupplierOffer[] = [
    {
      supplierId: '1',
      supplierName: 'Toyota AZ',
      price: 65.0,
      deliveryTime: 1,
      deliveryType: 'stock',
      warranty: 12,
      isOriginal: true,
      inStock: true,
      quantity: 50,
    },
    {
      supplierId: '2',
      supplierName: 'AutoParts Baku',
      price: 58.5,
      deliveryTime: 3,
      deliveryType: 'transit',
      warranty: 6,
      isOriginal: false,
      inStock: true,
      quantity: 20,
    },
    {
      supplierId: '3',
      supplierName: 'AvtoZap',
      price: 52.0,
      deliveryTime: 7,
      deliveryType: 'order',
      warranty: 3,
      isOriginal: false,
      inStock: false,
      quantity: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-header bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <UniversalSearchBar
                onSearch={handleSearch}
                onPartSelect={handlePartSelect}
                onVehicleSelect={handleVehicleSelect}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVinDecoder(!showVinDecoder)}
                className="p-2 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-light transition-colors"
                title="Декодер VIN"
              >
                <span className="text-xl">🚗</span>
              </button>
              <VehicleSelector onComplete={handleVehicleSelect} />
            </div>
          </div>

          {showVinDecoder && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-4"
            >
              <VinDecoderInput onDecode={handleVinDecode} />
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block flex-shrink-0">
            <div className="sticky top-36">
              <FiltersPanel
                filters={filters}
                onChange={handleFiltersChange}
                categories={categories}
                brands={brands}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Каталог автозапчастей</h1>
              <p className="text-gray-500 mt-1">
                {parts.length} товаров
                {filters.category && ` в категории "${filters.category}"`}
                {filters.brand && ` бренда ${filters.brand}`}
              </p>
            </div>

            <Suspense fallback={<div>Загрузка...</div>}>
              <PartsGrid parts={parts} isLoading={isLoading} />
            </Suspense>

            {selectedPart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Информация о детали</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Бренд</p>
                      <p className="font-medium">{selectedPart.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Артикул</p>
                      <p className="font-mono">{selectedPart.partNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Название</p>
                      <p className="font-medium">{selectedPart.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Категория</p>
                      <p className="font-medium">{selectedPart.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Цена</p>
                      <p className="text-2xl font-bold text-primary">{selectedPart.price} ₼</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Наличие</p>
                      <span className={selectedPart.inStock ? 'text-green-600' : 'text-red-600'}>
                        {selectedPart.inStock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </div>
                  </div>
                </div>

                <CrossReferencesBlock
                  brand={selectedPart.brand}
                  partNumber={selectedPart.partNumber || selectedPart.sku || ''}
                  initialCrossReferences={selectedPart.crossReferences}
                />

                <SupplierComparisonTable offers={mockOffers} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
