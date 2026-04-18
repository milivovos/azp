'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useVehicleStore } from '@/stores/vehicle-store';
import { vehicleLabel } from '@/lib/vehicle-cookie';

export type VehicleHeaderChipProps = {
  className?: string;
  onChangeClick?: () => void;
};

export function VehicleHeaderChip({ className, onChangeClick }: VehicleHeaderChipProps) {
  const vehicle = useVehicleStore((s) => s.vehicle);
  const hydrate = useVehicleStore((s) => s.hydrateFromDocumentCookie);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!vehicle) return null;

  return (
    <div
      className={cn(
        'inline-flex min-h-[44px] max-w-full items-center gap-ds-2 rounded-md border border-gray-200 bg-white px-ds-3 py-ds-2 text-sm shadow-sm',
        className,
      )}
    >
      <span className="truncate font-medium text-gray-900">{vehicleLabel(vehicle)}</span>
      <button
        type="button"
        onClick={onChangeClick}
        className="shrink-0 rounded-md px-2 py-1 text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        Сменить
      </button>
    </div>
  );
}
