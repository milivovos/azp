'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatVinMask, stripVinMask, validateVinIso3779 } from '@/lib/vin';
import { Input } from '@/components/ui/input';

export type VinDecoderInputProps = {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (formatted: string, raw: string) => void;
  onDecoded?: (raw: string, valid: boolean) => void;
  scanning?: boolean;
};

export function VinDecoderInput({
  className,
  value: controlled,
  defaultValue = '',
  onValueChange,
  onDecoded,
  scanning = false,
}: VinDecoderInputProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const display = isControlled ? controlled : uncontrolled;

  const raw = stripVinMask(display);
  const valid = raw.length === 17 && validateVinIso3779(raw);
  const showError = raw.length === 17 && !valid;

  return (
    <div className={cn('w-full max-w-md space-y-ds-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-gray-800">
        VIN
      </label>
      <div className="relative">
        <Input
          id={id}
          aria-invalid={showError}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="XXXX-XXXX-XXXX-XXXXX"
          value={display}
          onChange={(e) => {
            const next = formatVinMask(e.target.value);
            if (!isControlled) setUncontrolled(next);
            onValueChange?.(next, stripVinMask(next));
            const r = stripVinMask(next);
            if (r.length === 17) onDecoded?.(r, validateVinIso3779(r));
          }}
          className="font-mono tracking-wide uppercase"
        />
      </div>
      {scanning && (
        <div className="space-y-ds-2 rounded-md border border-primary-light bg-primary-light/40 p-ds-3">
          <div className="relative h-1 overflow-hidden rounded-full bg-white">
            <div className="absolute inset-y-0 w-1/3 animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/80" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/80" />
          </div>
        </div>
      )}
      {showError && (
        <p className="text-xs text-amber-800">Проверьте контрольную цифру (ISO 3779)</p>
      )}
      {valid && <p className="text-xs text-emerald-700">VIN распознан</p>}
    </div>
  );
}
