import { Hono } from 'hono';
import type { Database } from '@forkcart/database';
import { eq, or, ilike, desc, sql, and } from 'drizzle-orm';
import {
  autoParts,
  partCrossReferences,
  vehicles,
  vinDecodeCache,
} from '@forkcart/database/schemas';

export function createAutoPartsSearchRoutes(db: Database) {
  const app = new Hono();

  // Search auto parts by part number, name, or brand
  app.get('/search', async (c) => {
    const query = c.req.query('q') || '';
    const type = c.req.query('type') || 'part'; // 'part', 'car', 'vin', 'text'
    const brand = c.req.query('brand');
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    if (!query && type === 'part') {
      // Return featured/popular parts if no query
      const results = await db
        .select()
        .from(autoParts)
        .where(eq(autoParts.inStock, true))
        .orderBy(desc(autoParts.stockQuantity))
        .limit(limit)
        .offset(offset);

      return c.json({ data: results, pagination: { total: results.length, limit, offset } });
    }

    let results: (typeof autoParts.$inferSelect)[] = [];
    let total = 0;

    if (type === 'part') {
      // Normalize query (remove dashes, spaces)
      const normalizedQuery = query.replace(/[-\s]/g, '').toLowerCase();

      // Search by part number, normalized number, name, or brand
      const searchCondition = or(
        ilike(autoParts.partNumber, `%${query}%`),
        ilike(autoParts.partNumberNormalized, `%${normalizedQuery}%`),
        ilike(autoParts.name, `%${query}%`),
        ilike(autoParts.brand, `%${query}%`),
      );

      const brandCondition = brand ? eq(autoParts.brand, brand) : undefined;
      const categoryCondition = category ? eq(autoParts.category, category) : undefined;

      const whereClause = and(searchCondition, brandCondition, categoryCondition);

      results = await db.select().from(autoParts).where(whereClause).limit(limit).offset(offset);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(autoParts)
        .where(whereClause);
      total = countResult[0]?.count || 0;

      // Add cross references to each result
      for (const part of results) {
        const crosses = await db
          .select()
          .from(partCrossReferences)
          .where(
            or(
              and(
                eq(partCrossReferences.sourceBrand, part.brand),
                eq(partCrossReferences.sourceNumber, part.partNumber),
              ),
              and(
                eq(partCrossReferences.targetBrand, part.brand),
                eq(partCrossReferences.targetNumber, part.partNumber),
              ),
            ),
          );
        (part as any).crossReferences = crosses;
      }
    } else if (type === 'car') {
      // Search by vehicle
      const vehiclesResult = await db
        .select()
        .from(vehicles)
        .where(
          or(
            ilike(vehicles.brand, `%${query}%`),
            ilike(vehicles.model, `%${query}%`),
            ilike(vehicles.generation, `%${query}%`),
          ),
        )
        .limit(20);

      // Get parts compatible with found vehicles
      const vehicleIds = vehiclesResult.map((v) => v.id);
      if (vehicleIds.length > 0) {
        results = await db.select().from(autoParts).where(eq(autoParts.inStock, true)).limit(limit);
      }

      return c.json({
        data: results,
        vehicles: vehiclesResult,
        pagination: { total: results.length, limit, offset },
      });
    } else if (type === 'vin') {
      // VIN decode (simplified - in production would call external API)
      const vin = query.toUpperCase();

      if (vin.length !== 17) {
        return c.json({ error: 'Invalid VIN format' }, 400);
      }

      // Check cache first
      const cached = await db
        .select()
        .from(vinDecodeCache)
        .where(and(eq(vinDecodeCache.vin, vin), sql`expires_at > NOW()`))
        .limit(1);

      if (cached.length > 0) {
        return c.json({ data: cached[0], source: 'cache' });
      }

      // For demo, return mock decoded data
      // In production: integrate with TecDoc, QWEP, or ABCP API
      const mockDecode = {
        vin,
        manufacturer: vin.substring(0, 3),
        year: 2020 + (parseInt(vin.charAt(9)) || 0),
        model: 'Generic',
        bodyType: 'sedan',
        engine: '2.0L',
        fuelType: 'petrol',
      };

      return c.json({ data: mockDecode, source: 'mock' });
    } else {
      // Text search - search everywhere
      results = await db
        .select()
        .from(autoParts)
        .where(
          or(
            ilike(autoParts.name, `%${query}%`),
            ilike(autoParts.description, `%${query}%`),
            ilike(autoParts.brand, `%${query}%`),
          ),
        )
        .limit(limit)
        .offset(offset);
    }

    return c.json({
      data: results,
      pagination: { total, limit, offset },
      query: { q: query, type },
    });
  });

  // Get cross references for a specific part
  app.get('/crosses/:brand/:partNumber', async (c) => {
    const brand = c.req.param('brand');
    const partNumber = c.req.param('partNumber');

    const crosses = await db
      .select()
      .from(partCrossReferences)
      .where(
        or(
          and(
            eq(partCrossReferences.sourceBrand, brand),
            eq(partCrossReferences.sourceNumber, partNumber),
          ),
          and(
            eq(partCrossReferences.targetBrand, brand),
            eq(partCrossReferences.targetNumber, partNumber),
          ),
        ),
      );

    return c.json({ data: crosses });
  });

  // Get categories
  app.get('/categories', async (c) => {
    const categories = await db
      .select({
        category: autoParts.category,
        count: sql<number>`count(*)::int`,
      })
      .from(autoParts)
      .where(eq(autoParts.inStock, true))
      .groupBy(autoParts.category)
      .orderBy(desc(sql`count(*)`));

    return c.json({ data: categories });
  });

  // Get brands
  app.get('/brands', async (c) => {
    const brands = await db
      .select({
        brand: autoParts.brand,
        count: sql<number>`count(*)::int`,
      })
      .from(autoParts)
      .where(eq(autoParts.inStock, true))
      .groupBy(autoParts.brand)
      .orderBy(desc(sql`count(*)`));

    return c.json({ data: brands });
  });

  // Get vehicles (for car selection)
  app.get('/vehicles', async (c) => {
    const brand = c.req.query('brand');
    const model = c.req.query('model');

    let vehiclesResult;
    if (brand && model) {
      vehiclesResult = await db
        .select()
        .from(vehicles)
        .where(and(eq(vehicles.brand, brand), eq(vehicles.model, model)))
        .orderBy(vehicles.yearTo);
    } else if (brand) {
      vehiclesResult = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.brand, brand))
        .orderBy(vehicles.model);
    } else {
      vehiclesResult = await db
        .select({
          brand: vehicles.brand,
          count: sql<number>`count(*)::int`,
        })
        .from(vehicles)
        .groupBy(vehicles.brand)
        .orderBy(desc(sql`count(*)`));
    }

    return c.json({ data: vehiclesResult });
  });

  return app;
}
