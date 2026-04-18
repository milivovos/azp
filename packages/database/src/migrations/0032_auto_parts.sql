-- Auto Parts Tables for ForkCart
-- Search by part number, car, VIN

-- Vehicle brands (markalar)
CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  logo VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle models (modeller)
CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES vehicle_brands(id),
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles (avtomobillər)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  generation VARCHAR(50),
  year_from INTEGER,
  year_to INTEGER,
  engine VARCHAR(100),
  engine_code VARCHAR(50),
  power INTEGER,
  fuel_type VARCHAR(20),
  transmission VARCHAR(20),
  drive_type VARCHAR(20),
  body_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model_gen ON vehicles(brand, model, generation);

-- Auto parts (avtomobil ehtiyat hissələri)
CREATE TABLE IF NOT EXISTS auto_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  part_number VARCHAR(100) NOT NULL,
  part_number_normalized VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AZN',
  original_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  supplier VARCHAR(100),
  manufacturer_country VARCHAR(50),
  weight DECIMAL(8,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  dimensions VARCHAR(50),
  sku VARCHAR(50) UNIQUE,
  barcode VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_brand_part ON auto_parts(brand, part_number);
CREATE INDEX IF NOT EXISTS idx_parts_normalized ON auto_parts(part_number_normalized);
CREATE INDEX IF NOT EXISTS idx_parts_name ON auto_parts(name);
CREATE INDEX IF NOT EXISTS idx_parts_category ON auto_parts(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_parts_sku ON auto_parts(sku) WHERE sku IS NOT NULL;

-- Part cross references (kross-referanslar/analoglar)
CREATE TABLE IF NOT EXISTS part_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_brand VARCHAR(100) NOT NULL,
  source_number VARCHAR(100) NOT NULL,
  target_brand VARCHAR(100) NOT NULL,
  target_number VARCHAR(100) NOT NULL,
  target_name VARCHAR(255),
  confidence INTEGER DEFAULT 100,
  source VARCHAR(50) NOT NULL,
  is_bidirectional BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cross_source ON part_cross_references(source_brand, source_number);
CREATE INDEX IF NOT EXISTS idx_cross_target ON part_cross_references(target_brand, target_number);

-- Part compatibility with vehicles (uyğunluq)
CREATE TABLE IF NOT EXISTS part_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES auto_parts(id),
  vehicle_id UUID REFERENCES vehicles(id),
  fitment_status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VIN decode cache
CREATE TABLE IF NOT EXISTS vin_decode_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin VARCHAR(17) NOT NULL UNIQUE,
  wmi VARCHAR(3),
  vds VARCHAR(6),
  vis VARCHAR(8),
  year INTEGER,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  body_type VARCHAR(50),
  engine VARCHAR(100),
  transmission VARCHAR(20),
  drive_type VARCHAR(20),
  fuel_type VARCHAR(20),
  country VARCHAR(100),
  raw_data TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vin_expires ON vin_decode_cache(vin, expires_at);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query VARCHAR(500) NOT NULL,
  query_type VARCHAR(20),
  query_normalized VARCHAR(500),
  results_count INTEGER DEFAULT 0,
  user_id UUID,
  session_id VARCHAR(100),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_session ON search_history(session_id);
CREATE INDEX IF NOT EXISTS idx_search_created ON search_history(created_at);