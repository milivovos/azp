import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brand: varchar('brand', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    generation: varchar('generation', { length: 50 }),
    yearFrom: integer('year_from'),
    yearTo: integer('year_to'),
    engine: varchar('engine', { length: 100 }),
    engineCode: varchar('engine_code', { length: 50 }),
    power: integer('power'), // HP
    fuelType: varchar('fuel_type', { length: 20 }), // petrol, diesel, electric, hybrid
    transmission: varchar('transmission', { length: 20 }), // auto, manual, robot
    driveType: varchar('drive_type', { length: 20 }), // fwd, rwd, awd
    bodyType: varchar('body_type', { length: 50 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    brandModelIdx: index('idx_vehicles_brand_model').on(table.brand, table.model),
    brandModelGenIdx: index('idx_vehicles_brand_model_gen').on(
      table.brand,
      table.model,
      table.generation,
    ),
  }),
);

export const vehicleBrands = pgTable('vehicle_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  logo: varchar('logo', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicleModels = pgTable('vehicle_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => vehicleBrands.id),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const partCrossReferences = pgTable(
  'part_cross_references',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceBrand: varchar('source_brand', { length: 100 }).notNull(),
    sourceNumber: varchar('source_number', { length: 100 }).notNull(),
    targetBrand: varchar('target_brand', { length: 100 }).notNull(),
    targetNumber: varchar('target_number', { length: 100 }).notNull(),
    targetName: varchar('target_name', { length: 255 }),
    confidence: integer('confidence').default(100), // 0-100
    source: varchar('source', { length: 50 }).notNull(), // 'tecdoc', 'abcp', 'manual', 'calculated'
    isBidirectional: boolean('is_bidirectional').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    sourceIdx: index('idx_cross_source').on(table.sourceBrand, table.sourceNumber),
    targetIdx: index('idx_cross_target').on(table.targetBrand, table.targetNumber),
  }),
);

export const partCompatibility = pgTable('part_compatibility', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('part_id').references(() => autoParts.id),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id),
  fitmentStatus: varchar('fitment_status', { length: 20 }).notNull(), // 'exact', 'possible', 'unknown'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vinDecodeCache = pgTable(
  'vin_decode_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vin: varchar('vin', { length: 17 }).notNull(),
    wmi: varchar('wmi', { length: 3 }),
    vds: varchar('vds', { length: 6 }),
    vis: varchar('vis', { length: 8 }),
    year: integer('year'),
    manufacturer: varchar('manufacturer', { length: 100 }),
    model: varchar('model', { length: 100 }),
    bodyType: varchar('body_type', { length: 50 }),
    engine: varchar('engine', { length: 100 }),
    transmission: varchar('transmission', { length: 20 }),
    driveType: varchar('drive_type', { length: 20 }),
    fuelType: varchar('fuel_type', { length: 20 }),
    country: varchar('country', { length: 100 }),
    rawData: text('raw_data'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    vinIdx: uniqueIndex('idx_vin_unique').on(table.vin),
    vinExpIdx: index('idx_vin_expires').on(table.vin, table.expiresAt),
  }),
);

export const autoParts = pgTable(
  'auto_parts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brand: varchar('brand', { length: 100 }).notNull(),
    partNumber: varchar('part_number', { length: 100 }).notNull(),
    partNumberNormalized: varchar('part_number_normalized', { length: 100 }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    subcategory: varchar('subcategory', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('AZN'),
    originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
    inStock: boolean('in_stock').default(true),
    stockQuantity: integer('stock_quantity').default(0),
    supplier: varchar('supplier', { length: 100 }),
    manufacturerCountry: varchar('manufacturer_country', { length: 50 }),
    weight: decimal('weight', { precision: 8, scale: 2 }),
    weightUnit: varchar('weight_unit', { length: 10 }).default('kg'),
    dimensions: varchar('dimensions', { length: 50 }), // LxWxH
    sku: varchar('sku', { length: 50 }),
    barcode: varchar('barcode', { length: 50 }),
    isActive: boolean('is_active').default(true),
    metadata: text('metadata'), // JSON
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    brandPartIdx: index('idx_parts_brand_part').on(table.brand, table.partNumber),
    partNormIdx: index('idx_parts_normalized').on(table.partNumberNormalized),
    nameIdx: index('idx_parts_name').on(table.name),
    categoryIdx: index('idx_parts_category').on(table.category, table.subcategory),
    skuIdx: uniqueIndex('idx_parts_sku').on(table.sku),
  }),
);

export const searchHistory = pgTable(
  'search_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    query: varchar('query', { length: 500 }).notNull(),
    queryType: varchar('query_type', { length: 20 }), // 'part', 'car', 'vin', 'text'
    queryNormalized: varchar('query_normalized', { length: 500 }),
    resultsCount: integer('results_count').default(0),
    userId: uuid('user_id'),
    sessionId: varchar('session_id', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    queryIdx: index('idx_search_query').on(table.query),
    sessionIdx: index('idx_search_session').on(table.sessionId),
    createdIdx: index('idx_search_created').on(table.createdAt),
  }),
);

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  compatibilities: many(partCompatibility),
}));

export const autoPartsRelations = relations(autoParts, ({ many }) => ({
  compatibilities: many(partCompatibility),
}));

export const partCompatibilityRelations = relations(partCompatibility, ({ one }) => ({
  part: one(autoParts, {
    fields: [partCompatibility.partId],
    references: [autoParts.id],
  }),
  vehicle: one(vehicles, {
    fields: [partCompatibility.vehicleId],
    references: [vehicles.id],
  }),
}));
