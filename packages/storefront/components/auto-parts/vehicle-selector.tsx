'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicleStore } from '@/stores/vehicle-store';
import type { Vehicle, VehicleBrand } from '@/types/parts';

interface VehicleSelectorProps {
  onComplete?: (vehicle: Vehicle) => void;
}

const steps = [
  { key: 'brand', label: 'Марка', icon: '🏷️' },
  { key: 'model', label: 'Модель', icon: '🚗' },
  { key: 'generation', label: 'Поколение', icon: '📅' },
  { key: 'engine', label: 'Двигатель', icon: '⚙️' },
] as const;

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function VehicleSelector({ onComplete }: VehicleSelectorProps) {
  const {
    step,
    brand,
    model,
    generation,
    vehicle,
    isComplete,
    setBrand,
    setModel,
    setGeneration,
    setVehicle,
    reset,
  } = useVehicleStore();

  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [generations, setGenerations] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('http://localhost:4000/api/v1/auto-parts/vehicles')
      .then((res) => res.json())
      .then((data) => {
        const brandMap = new Map<string, VehicleBrand>();
        (data.data || []).forEach((v: Vehicle) => {
          if (!brandMap.has(v.brand)) {
            brandMap.set(v.brand, { id: v.brand, name: v.brand, logo: '', models: [] });
          }
          const brand = brandMap.get(v.brand)!;
          if (!brand.models.find((m) => m.name === v.model)) {
            brand.models.push({ id: v.model, name: v.model, generations: [] });
          }
        });
        setBrands(Array.from(brandMap.values()));
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!brand || !isOpen) return;
    setLoading(true);
    fetch(`http://localhost:4000/api/v1/auto-parts/vehicles?brand=${encodeURIComponent(brand)}`)
      .then((res) => res.json())
      .then((data) => {
        const vehicleData = data.data || [];
        setModels([...new Set(vehicleData.map((v: Vehicle) => v.model))] as string[]);
        setVehicles(vehicleData);
      })
      .finally(() => setLoading(false));
  }, [brand, isOpen]);

  useEffect(() => {
    if (!model || !vehicles.length) return;
    const modelVehicles = vehicles.filter((v) => v.model === model);
    setGenerations([
      ...new Set(modelVehicles.map((v) => v.generation).filter(Boolean)),
    ] as string[]);
  }, [model, vehicles]);

  useEffect(() => {
    if (!generation || !vehicles.length) return;
    const genVehicles = vehicles.filter((v) => v.generation === generation);
    setEngines([...new Set(genVehicles.map((v) => v.engine).filter(Boolean))] as string[]);
  }, [generation, vehicles]);

  const handleSelect = useCallback(
    (value: string) => {
      if (step === 'brand') setBrand(value);
      else if (step === 'model') setModel(value);
      else if (step === 'generation') setGeneration(value);
    },
    [step, setBrand, setModel, setGeneration],
  );

  const handleVehicleSelect = useCallback(
    (v: Vehicle) => {
      setVehicle(v);
      onComplete?.(v);
    },
    [setVehicle, onComplete],
  );

  const currentOptions = loading
    ? []
    : step === 'brand'
      ? brands.map((b) => b.name)
      : step === 'model'
        ? models
        : step === 'generation'
          ? generations
          : engines;

  const filteredOptions = searchQuery
    ? currentOptions.filter((o) => o.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentOptions;

  if (isComplete && vehicle) {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary-light rounded-lg border border-primary/20">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-xs text-gray-500">
            {vehicle.engine} • {vehicle.bodyType}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          Изменить
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          ✕
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
        <span className="text-lg">🚗</span>
        Выбрать автомобиль
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Выбор автомобиля</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    ✕
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  {steps.map((s, i) => (
                    <div key={s.key} className="flex-1">
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-colors',
                          steps.findIndex((st) => st.key === step) >= i
                            ? 'bg-primary'
                            : 'bg-gray-200',
                        )}
                      />
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <Input
                      placeholder={`Поиск ${steps.find((s) => s.key === step)?.label.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<span>🔍</span>}
                    />

                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">Ничего не найдено</p>
                        ) : (
                          filteredOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleSelect(option)}
                              className="w-full p-3 text-left rounded-lg border border-gray-100 hover:border-primary hover:bg-primary-light transition-colors"
                            >
                              {option}
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {step === 'engine' && vehicles.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Найденные автомобили:</p>
                        <div className="space-y-2">
                          {vehicles
                            .filter((v) => !generation || v.generation === generation)
                            .map((v) => (
                              <button
                                key={v.id}
                                onClick={() => handleVehicleSelect(v)}
                                className="w-full p-3 text-left rounded-lg border border-gray-100 hover:border-primary hover:bg-primary-light transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium">
                                    {v.brand} {v.model}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {v.engine} • {v.yearFrom}-{v.yearTo}
                                  </p>
                                </div>
                                <Badge variant="primary">Выбрать</Badge>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
