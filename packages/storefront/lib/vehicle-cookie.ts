import type { Vehicle } from '@/types/parts';

export const VEHICLE_COOKIE = 'forkcart_vehicle_v1';

export type VehicleSelection = {
  brand: string;
  model: string;
  year: string;
  engine: string;
};

export function serializeVehicle(v: VehicleSelection): string {
  return encodeURIComponent(JSON.stringify(v));
}

export function parseVehicle(raw: string | undefined | null): VehicleSelection | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const v = JSON.parse(decoded) as VehicleSelection;
    if (!v?.brand || !v?.model || !v?.year || !v?.engine) return null;
    return v;
  } catch {
    return null;
  }
}

export function vehicleLabel(v: Vehicle | VehicleSelection): string {
  return `${v.brand} ${v.model} ${v.engine || ''}`.trim();
}
