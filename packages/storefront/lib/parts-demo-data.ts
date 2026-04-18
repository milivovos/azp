import type { CrossReferenceRow, Part, SupplierOffer } from '@/types/parts';

/** Демо-данные для главной, когда бэкенд ещё не заполнен или для витрины UI. */
export const DEMO_SHOWCASE_PARTS: Part[] = [
  {
    id: 'demo-1',
    sku: '58101-2M000',
    brand: 'HYUNDAI',
    name: 'Бампер передний (покраска под заказ)',
    price: 38500,
    stock: 'in',
    compatibles: ['Genesis', 'G80'],
    images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d0?w=640&q=80'],
    currency: 'AZN',
  },
  {
    id: 'demo-2',
    sku: '26300-35505',
    brand: 'MOBIS',
    name: 'Комплект фильтров (масло + салон)',
    price: 8900,
    stock: 'in',
    compatibles: ['KIA', 'Hyundai'],
    images: ['https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=640&q=80'],
    currency: 'AZN',
  },
  {
    id: 'demo-3',
    sku: '52933-D4100',
    brand: 'HYUNDAI',
    name: 'Радиатор охлаждения',
    price: 41200,
    stock: 'order',
    compatibles: ['Tucson', 'Sportage'],
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80'],
    currency: 'AZN',
  },
  {
    id: 'demo-4',
    sku: '37300-2E600',
    brand: 'GENESIS',
    name: 'Стартер восстановленный',
    price: 25600,
    stock: 'out',
    compatibles: ['G70'],
    images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=640&q=80'],
    currency: 'AZN',
  },
];

export const DEMO_CROSS_ROWS: CrossReferenceRow[] = Array.from({ length: 48 }).map((_, i) => ({
  id: `demo-x-${i}`,
  sku: `ALT-${4200 + i}`,
  brand: i % 4 === 0 ? 'MOBIS' : 'VALEO',
  name: `Аналог позиции ${i + 1}`,
  price: 4500 + i * 120,
  leadDays: (i % 5) + 1,
  rating: 3.6 + (i % 4) * 0.3,
  compatibility: i === 0 ? 1 : 0.5 + (i % 8) * 0.05,
}));

export const DEMO_SUPPLIERS: SupplierOffer[] = [
  {
    id: 'd1',
    supplierName: 'Baku Auto Stock',
    price: 37200,
    leadDaysMin: 1,
    leadDaysMax: 1,
    rating: 4.9,
    inStock: true,
  },
  {
    id: 'd2',
    supplierName: 'Caspian Parts Hub',
    price: 35900,
    leadDaysMin: 3,
    leadDaysMax: 5,
    rating: 4.6,
    inStock: true,
  },
  {
    id: 'd3',
    supplierName: 'Import Line AZ',
    price: 34000,
    leadDaysMin: null,
    leadDaysMax: null,
    rating: 4.2,
    inStock: false,
  },
];
