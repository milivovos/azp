'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVehicleStore } from '@/stores/vehicle-store';
import type { VehicleSelection } from '@/lib/vehicle-cookie';

const BRANDS = ['HYUNDAI', 'KIA', 'GENESIS', 'TOYOTA'];
const MODELS: Record<string, string[]> = {
  HYUNDAI: ['Genesis', 'Sonata', 'Tucson'],
  KIA: ['Stinger', 'Sportage', 'Optima'],
  GENESIS: ['G70', 'G80', 'G90'],
  TOYOTA: ['Camry', 'RAV4', 'Land Cruiser'],
};
const YEARS = ['2024', '2023', '2022', '2021', '2020'];
const ENGINES = ['2.0 T-GDI', '3.3 GDI', '2.5 MPI', '3.8 V6'];

type Step = 0 | 1 | 2 | 3;

export type VehicleSelectorProps = {
  className?: string;
  onComplete?: (v: VehicleSelection) => void;
};

export function VehicleSelector({ className, onComplete }: VehicleSelectorProps) {
  const setVehicle = useVehicleStore((s) => s.setVehicle);
  const hydrate = useVehicleStore((s) => s.hydrateFromDocumentCookie);

  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Partial<VehicleSelection>>({});

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(draft.brand);
    if (step === 1) return Boolean(draft.model);
    if (step === 2) return Boolean(draft.year);
    if (step === 3) return Boolean(draft.engine);
    return false;
  }, [draft.brand, draft.engine, draft.model, draft.year, step]);

  const finish = () => {
    const v = draft as VehicleSelection;
    if (!v.brand || !v.model || !v.year || !v.engine) return;
    setVehicle(v);
    onComplete?.(v);
  };

  return (
    <div
      className={cn(
        'w-full max-w-lg rounded-xl border border-gray-100 bg-white p-ds-5 shadow-md',
        className,
      )}
    >
      <div className="mb-ds-5">
        <div className="mb-ds-2 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>Шаг {step + 1} из 4</span>
          <span>Выбор авто</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="min-h-[220px]"
        >
          {step === 0 && (
            <div className="grid grid-cols-2 gap-ds-2">
              {BRANDS.map((b) => (
                <ChoiceButton
                  key={b}
                  label={b}
                  selected={draft.brand === b}
                  onClick={() => setDraft((d) => ({ ...d, brand: b, model: undefined }))}
                />
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-ds-2 sm:grid-cols-2">
              {(MODELS[draft.brand ?? ''] ?? []).map((m) => (
                <ChoiceButton
                  key={m}
                  label={m}
                  selected={draft.model === m}
                  onClick={() => setDraft((d) => ({ ...d, model: m }))}
                />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-3 gap-ds-2">
              {YEARS.map((y) => (
                <ChoiceButton
                  key={y}
                  label={y}
                  selected={draft.year === y}
                  onClick={() => setDraft((d) => ({ ...d, year: y }))}
                />
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-ds-2">
              {ENGINES.map((e) => (
                <ChoiceButton
                  key={e}
                  label={e}
                  selected={draft.engine === e}
                  onClick={() => setDraft((d) => ({ ...d, engine: e }))}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-ds-5 flex flex-wrap gap-ds-2">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
            Назад
          </Button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <Button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && setStep((s) => (s + 1) as Step)}
          >
            Далее
          </Button>
        ) : (
          <Button type="button" disabled={!canNext} onClick={finish}>
            Сохранить
          </Button>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[44px] rounded-md border px-ds-3 py-ds-2 text-left text-sm font-medium transition-colors duration-base ease-motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        selected
          ? 'border-primary bg-primary-light text-gray-900'
          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300',
      )}
    >
      {label}
    </button>
  );
}
