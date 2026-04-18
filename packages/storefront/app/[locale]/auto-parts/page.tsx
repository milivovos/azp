'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UniversalSearchBar,
  VehicleSelector,
  VinDecoderInput,
  PartCard,
  PartCardSkeleton,
  PartCardEmpty,
  FacetedFilterPanel,
  CategoryNavTree,
} from '@/components';
import type { Part, Category, Brand, PartFilter, Vehicle } from '@/types/parts';
import { useVehicleStore } from '@/stores/vehicle-store';

interface PartsGridProps {
  parts: Part[];
  isLoading: boolean;
}

function PartsGrid({ parts, isLoading }: PartsGridProps) {
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

interface FiltersPanelProps {
  filters: PartFilter;
  onChange: (f: PartFilter) => void;
  categories: Category[];
  brands: Brand[];
}

function FiltersPanel({ filters, onChange, categories, brands }: FiltersPanelProps) {
  return (
    <FacetedFilterPanel
      filters={filters}
      onFiltersChange={onChange}
      categories={categories}
      brands={brands}
    />
  );
}

export const dynamic = 'force-dynamic';

function AutoPartsContent() {
  const searchParams = useSearchParams();
  const { vehicle: selectedVehicle, setVehicle: setSelectedVehicle } = useVehicleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<PartFilter>({
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    priceMin: undefined,
    priceMax: undefined,
    inStock: false,
  });
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showVinDecoder, setShowVinDecoder] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const fetchParts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedVehicle?.id) params.set('vehicleId', selectedVehicle.id);
      if (filters.category) params.set('category', filters.category);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
      if (filters.inStock) params.set('inStock', 'true');

      const res = await fetch(`/api/v1/auto-parts/search?${params}`);
      const data = await res.json();
      const mappedParts = (data.data || []).map((p: any) => ({
        id: p.id,
        sku: p.sku || p.partNumber,
        partNumber: p.partNumber,
        partNumberNormalized: p.partNumberNormalized,
        brand: p.brand,
        name: p.name,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        price: parseFloat(p.price) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
        currency: p.currency || 'AZN',
        stock: p.inStock ? 'in' : 'out',
        stockQuantity: p.stockQuantity || 0,
        supplier: p.supplier,
        manufacturerCountry: p.manufacturerCountry,
        weight: p.weight ? parseFloat(p.weight) : undefined,
        dimensions: p.dimensions,
        barcode: p.barcode,
        images: [],
        crossReferences: [],
        compatibilities: [],
        isActive: p.isActive ?? true,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      setParts(mappedParts);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
      setParts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedVehicle, filters]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  useEffect(() => {
    async function loadMeta() {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/v1/categories'),
        fetch('/api/v1/auto-parts/brands'),
      ]);
      const [catData, brandData] = await Promise.all([catRes.json(), brandRes.json()]);
      setCategories(catData.data?.categories || catData.categories || []);
      setBrands(brandData.data || []);
    }
    loadMeta().catch(console.error);
  }, []);

  const handleVinDecode = async (result: { vin: string; vehicles?: Vehicle[] }) => {
    const v = result.vehicles?.[0];
    if (v) {
      setSelectedVehicle(v);
      setShowVinDecoder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <UniversalSearchBar
                onSearch={(query) => {
                  setSearchQuery(query);
                  fetchParts();
                }}
              />
            </div>
            <button
              onClick={() => setShowVehicleSelector(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF7A3D] text-white rounded-lg font-medium hover:bg-[#E56A2D] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {selectedVehicle
                ? `${selectedVehicle.year || selectedVehicle.yearFrom} ${selectedVehicle.brand} ${selectedVehicle.model}`
                : 'Выбрать авто'}
            </button>
            <button
              onClick={() => setShowVinDecoder(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              VIN
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              categories={categories}
              brands={brands}
            />
            <div className="mt-6">
              <CategoryNavTree categories={categories} />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  {parts.length}{' '}
                  {parts.length === 1 ? 'товар' : parts.length < 5 ? 'товара' : 'товаров'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg ${view === 'grid' ? 'bg-[#FF7A3D] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg ${view === 'list' ? 'bg-[#FF7A3D] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <PartsGrid parts={parts} isLoading={isLoading} />
          </main>
        </div>
      </div>

      {showVehicleSelector && (
        <VehicleSelector
          onComplete={(vehicle) => {
            setSelectedVehicle(vehicle);
            setShowVehicleSelector(false);
          }}
        />
      )}

      {showVinDecoder && <VinDecoderInput onDecode={handleVinDecode} />}
    </div>
  );
}

export default function AutoPartsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>}>
      <AutoPartsContent />
    </Suspense>
  );
}