'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle, VehicleSelectionStep, VehicleSelectionState } from '@/types/parts';

const VEHICLE_COOKIE = 'forkcart_vehicle_v1';

interface VehicleStore extends VehicleSelectionState {
  setStep: (step: VehicleSelectionStep) => void;
  setBrand: (brand: string) => void;
  setModel: (model: string) => void;
  setGeneration: (generation: string) => void;
  setEngine: (engine: string) => void;
  setVehicle: (vehicle: Vehicle) => void;
  reset: () => void;
  complete: () => void;
  hydrateFromDocumentCookie: () => void;
}

const initialState: VehicleSelectionState = {
  step: 'brand',
  brand: undefined,
  model: undefined,
  generation: undefined,
  engine: undefined,
  vehicle: undefined,
  isComplete: false,
};

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setBrand: (brand) =>
        set({
          brand,
          model: undefined,
          generation: undefined,
          engine: undefined,
          vehicle: undefined,
          isComplete: false,
          step: 'model',
        }),

      setModel: (model) =>
        set({
          model,
          generation: undefined,
          engine: undefined,
          vehicle: undefined,
          isComplete: false,
          step: 'generation',
        }),

      setGeneration: (generation) =>
        set({
          generation,
          engine: undefined,
          vehicle: undefined,
          isComplete: false,
          step: 'engine',
        }),

      setEngine: (engine) =>
        set({
          engine,
          vehicle: undefined,
          isComplete: false,
        }),

      setVehicle: (vehicle) =>
        set({
          vehicle,
          isComplete: true,
          step: 'brand',
        }),

      reset: () => set(initialState),

      complete: () => set({ isComplete: true }),

      hydrateFromDocumentCookie: () => {
        if (typeof document === 'undefined') return;
        try {
          const match = document.cookie.match(new RegExp('(^| )' + VEHICLE_COOKIE + '=([^;]+)'));
          if (match && match[2]) {
            const decoded = decodeURIComponent(match[2]);
            const parsed = JSON.parse(decoded) as Vehicle;
            if (parsed?.brand && parsed?.model) {
              set({ vehicle: parsed, isComplete: true });
            }
          }
        } catch (e) {
          console.error('Failed to hydrate vehicle from cookie:', e);
        }
      },
    }),
    {
      name: 'vehicle-selection',
    },
  ),
);
