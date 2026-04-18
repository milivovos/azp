import type { CrossReferenceRow, Part, SupplierOffer } from '../types/parts';

export const MOCK_PART: Part = {
  id: 'p1',
  sku: '58101-3M000',
  brand: 'HYUNDAI',
  name: 'Бампер передний в сборе',
  price: 42800,
  stock: 'in',
  compatibles: ['Genesis3.3', 'G80'],
  images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d0?w=640&q=80'],
};

export const MOCK_CROSS: CrossReferenceRow[] = Array.from({ length: 80 }).map((_, i) => ({
  id: `c-${i}`,
  sku: `ALT-${1000 + i}`,
  brand: i % 5 === 0 ? 'MOBIS' : 'AFTERMARKET',
  name: `Аналог ${i + 1}`,
  price: 12000 + i * 350,
  leadDays: (i % 7) + 1,
  rating: 3 + (i % 3) * 0.4,
  compatibility: i === 0 ? 1 : 0.45 + (i % 10) * 0.05,
}));

export const MOCK_SUPPLIERS: SupplierOffer[] = [
  {
    id: 's1',
    supplierName: 'Склад Юг',
    price: 40200,
    leadDaysMin: 1,
    leadDaysMax: 1,
    rating: 4.8,
    inStock: true,
  },
  {
    id: 's2',
    supplierName: 'АвтоПартс24',
    price: 38900,
    leadDaysMin: 3,
    leadDaysMax: 5,
    rating: 4.5,
    inStock: true,
  },
  {
    id: 's3',
    supplierName: 'Импорт',
    price: 36500,
    leadDaysMin: null,
    leadDaysMax: null,
    rating: 4.1,
    inStock: false,
  },
];
