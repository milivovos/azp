'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { VinDecodeResult } from '@/types/parts';

interface VinDecoderInputProps {
  onDecode?: (result: VinDecodeResult) => void;
}

const VIN_LENGTH = 17;

function formatVin(value: string): string {
  const cleaned = value.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
  const groups = [];
  for (let i = 0; i < cleaned.length && i < VIN_LENGTH; i += 4) {
    groups.push(cleaned.slice(i, i + 4));
  }
  return groups.join('-');
}

function validateVin(vin: string): boolean {
  if (vin.length !== VIN_LENGTH) return false;
  const validChars = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return validChars.test(vin);
}

export function VinDecoderInput({ onDecode }: VinDecoderInputProps) {
  const [vin, setVin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VinDecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVin(e.target.value);
    setVin(formatted);
    setError(null);
    setResult(null);
  }, []);

  const handleDecode = useCallback(async () => {
    const cleanVin = vin.replace(/-/g, '');
    if (!validateVin(cleanVin)) {
      setError('Неверный формат VIN');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/auto-parts/search?q=${cleanVin}&type=vin`,
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.data);
        onDecode?.(data.data);
      }
    } catch (err) {
      setError('Ошибка при декодировании VIN');
    } finally {
      setIsScanning(false);
    }
  }, [vin, onDecode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleDecode();
      }
    },
    [handleDecode],
  );

  const handleClear = useCallback(() => {
    setVin('');
    setResult(null);
    setError(null);
  }, []);

  const cleanVin = vin.replace(/-/g, '');
  const isValid = cleanVin.length === VIN_LENGTH;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={vin}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="XXXX-XXXX-XXXX-XXXXX"
            maxLength={23}
            className={cn(
              'uppercase font-mono text-lg tracking-wider',
              error && 'border-error focus:ring-error',
              result && 'border-success',
            )}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            }
          />
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-primary"
              />
            </motion.div>
          )}
        </div>
        <Button onClick={handleDecode} disabled={!isValid || isScanning} variant="primary">
          {isScanning ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Сканирование...
            </span>
          ) : (
            'Декодировать'
          )}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {isScanning && (
        <div className="space-y-3 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-primary"
              >
                ⚙️
              </motion.span>
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-50 border border-green-200"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success" dot>
                  Найден
                </Badge>
                <span className="text-xs text-gray-500"> source: {result.source}</span>
              </div>
              <p className="font-semibold text-gray-900">
                {result.manufacturer} {result.model}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {result.year && <span>Год: {result.year}</span>}
                {result.bodyType && <span>Кузов: {result.bodyType}</span>}
                {result.engine && <span>Двигатель: {result.engine}</span>}
                {result.fuelType && <span>Топливо: {result.fuelType}</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              ✕
            </Button>
          </div>
        </motion.div>
      )}

      <p className="text-xs text-gray-400">
        VIN должен содержать 17 символов (A-Z, 0-9, кроме I, O, Q)
      </p>
    </div>
  );
}
