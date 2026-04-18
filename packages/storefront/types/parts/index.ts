export type StockStatus = 'in' | 'order' | 'out';

export interface Part {
  id: string;
  sku: string;
  partNumber: string;
  partNumberNormalized: string;
  brand: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stock: StockStatus;
  stockQuantity: number;
  supplier?: string;
  manufacturerCountry?: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  images: string[];
  crossReferences: CrossReference[];
  compatibilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrossReference {
  id: string;
  sourceBrand: string;
  sourceNumber: string;
  targetBrand: string;
  targetNumber: string;
  targetName?: string;
  confidence: number;
  source: 'tecdoc' | 'abcp' | 'manual' | 'calculated';
  isBidirectional: boolean;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  engine?: string;
  engineCode?: string;
  power?: number;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission?: 'auto' | 'manual' | 'robot';
  driveType?: 'fwd' | 'rwd' | 'awd';
  bodyType?: string;
  isActive: boolean;
}

export interface VehicleBrand {
  id: string;
  name: string;
  logo?: string;
  models: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  name: string;
  generations: VehicleGeneration[];
}

export interface VehicleGeneration {
  id: string;
  name: string;
  yearFrom: number;
  yearTo?: number;
}

export interface VinDecodeResult {
  vin: string;
  manufacturer: string;
  year?: number;
  model: string;
  bodyType?: string;
  engine?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  country?: string;
  rawData?: string;
  source?: string;
}

export interface SearchResult {
  parts: Part[];
  vehicles: Vehicle[];
  total: number;
  query: string;
  type: 'part' | 'car' | 'vin' | 'text';
}

export interface PartFilter {
  brand?: string;
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'relevance' | 'popularity';
  sortDirection?: 'asc' | 'desc';
}

export interface SupplierOffer {
  supplierId: string;
  supplierName: string;
  price: number;
  deliveryTime: number; // days
  deliveryType: 'stock' | 'transit' | 'order';
  warranty: number; // months
  isOriginal: boolean;
  inStock: boolean;
  quantity: number;
}

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

export interface SearchSuggestion {
  type: 'part' | 'car' | 'vin';
  text: string;
  subtext?: string;
  brand?: string;
}

export type VehicleSelectionStep = 'brand' | 'model' | 'generation' | 'engine';

export interface VehicleSelectionState {
  step: VehicleSelectionStep;
  brand?: string;
  model?: string;
  generation?: string;
  engine?: string;
  vehicle?: Vehicle;
  isComplete: boolean;
}
