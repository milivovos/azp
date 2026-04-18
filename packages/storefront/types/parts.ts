export type PartStock = 'in' | 'order' | 'out';

export interface Category {
  name: string;
  count: number;
  icon?: string;
  subcategories?: string[];
}

export interface Brand {
  name: string;
  count: number;
  logo?: string;
}

export type PartFilter = {
  brand?: string;
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'relevance' | 'popularity';
  sortDirection?: 'asc' | 'desc';
};

export type Part = {
  id: string;
  sku?: string;
  partNumber?: string;
  brand: string;
  name: string;
  description?: string;
  category?: string;
  /** Минимальные единицы валюты (как в API ForkCart). */
  price: number;
  originalPrice?: number;
  currency?: string;
  stock: PartStock;
  stockQuantity?: number;
  inStock?: boolean;
  compatibles: string[];
  images: string[];
  crossReferences?: CrossReferenceRow[];
  partNumberNormalized?: string;
  supplier?: string;
  manufacturerCountry?: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierOffer = {
  supplierId?: string;
  id?: string;
  supplierName: string;
  price: number;
  /** days until delivery, null = on request */
  leadDaysMin?: number | null;
  leadDaysMax?: number | null;
  deliveryTime?: number;
  deliveryType?: 'stock' | 'transit' | 'order';
  warranty?: number;
  /**0–5 */
  rating?: number;
  isOriginal?: boolean;
  inStock: boolean;
  quantity?: number;
};

export type CrossReferenceRow = {
  id: string;
  sku?: string;
  brand: string;
  name: string;
  price: number;
  leadDays: number;
  rating: number;
  /** 0–1 compatibility score */
  compatibility?: number;
  confidence?: number;
  sourceNumber?: string;
  targetNumber?: string;
  targetBrand?: string;
  targetName?: string;
  source?: 'tecdoc' | 'abcp' | 'manual' | 'calculated';
};

export type SearchGroup = 'articles' | 'vehicles' | 'vins';

export type UniversalSearchHit = {
  id: string;
  label: string;
  sublabel?: string;
  group: SearchGroup;
};

export type Vehicle = {
  id?: string;
  brand: string;
  model: string;
  year?: string;
  generation?: string;
  engine?: string;
  yearFrom?: number;
  yearTo?: number;
  engineCode?: string;
  power?: number;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  bodyType?: string;
  isActive?: boolean;
};

export type VehicleBrand = {
  id: string;
  name: string;
  logo?: string;
  models: VehicleModel[];
};

export type VehicleModel = {
  id: string;
  name: string;
  generations: VehicleGeneration[];
};

export type VehicleGeneration = {
  id: string;
  name: string;
  yearFrom: number;
  yearTo?: number;
};

export type VinDecodeResult = {
  vin: string;
  manufacturer?: string;
  year?: number;
  model?: string;
  bodyType?: string;
  engine?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  country?: string;
  rawData?: string;
  source?: string;
};

export type VehicleSelectionStep = 'brand' | 'model' | 'generation' | 'engine';

export type VehicleSelectionState = {
  step: VehicleSelectionStep;
  brand?: string;
  model?: string;
  generation?: string;
  engine?: string;
  vehicle?: Vehicle;
  isComplete: boolean;
};

export type SearchSuggestion = {
  type: 'part' | 'car' | 'vin';
  text: string;
  subtext?: string;
  brand?: string;
};
