'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { SearchSuggestion, Part, Vehicle } from '@/types/parts';

interface UniversalSearchBarProps {
  onSearch?: (query: string, type: string) => void;
  onPartSelect?: (part: Part) => void;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  className?: string;
}

export function UniversalSearchBar({
  onSearch,
  onPartSelect,
  onVehicleSelect,
  className,
}: UniversalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<{ parts: Part[]; vehicles: Vehicle[] }>({
    parts: [],
    vehicles: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchTypes = [
    { key: 'part', label: 'Артикул', icon: '🔍' },
    { key: 'car', label: 'Авто', icon: '🚗' },
    { key: 'vin', label: 'VIN', icon: '📋' },
  ];

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [partRes, carRes] = await Promise.all([
          fetch(`http://localhost:4000/api/v1/auto-parts/search?q=${query}&type=part&limit=3`),
          fetch(`http://localhost:4000/api/v1/auto-parts/search?q=${query}&type=car&limit=3`),
        ]);

        const [partData, carData] = await Promise.all([partRes.json(), carRes.json()]);

        const newSuggestions: SearchSuggestion[] = [];

        if (partData.data?.length > 0) {
          partData.data.forEach((p: Part) => {
            newSuggestions.push({
              type: 'part',
              text: p.partNumber || p.sku || p.id,
              subtext: `${p.brand} - ${p.name}`,
              brand: p.brand,
            });
          });
        }

        if (carData.vehicles?.length > 0) {
          carData.vehicles.forEach((v: Vehicle) => {
            newSuggestions.push({
              type: 'car',
              text: `${v.brand} ${v.model}`,
              subtext: v.generation || `${v.yearFrom}-${v.yearTo}`,
            });
          });
        }

        setSuggestions(newSuggestions);
        setSearchResults({
          parts: partData.data || [],
          vehicles: carData.vehicles || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [suggestions, selectedIndex],
  );

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.type === 'part') {
        const part = searchResults.parts.find((p) => p.partNumber === suggestion.text);
        if (part) {
          onPartSelect?.(part);
        }
      } else if (suggestion.type === 'car') {
        const vehicle = searchResults.vehicles.find(
          (v) => `${v.brand} ${v.model}` === suggestion.text,
        );
        if (vehicle) {
          onVehicleSelect?.(vehicle);
        }
      }
      setIsOpen(false);
      setQuery(suggestion.text);
    },
    [searchResults, onPartSelect, onVehicleSelect],
  );

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setIsOpen(false);
    onSearch?.(query, 'text');
  }, [query, onSearch]);

  const getTypeIcon = (type: string) => {
    return searchTypes.find((t) => t.key === type)?.icon || '🔍';
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Поиск по артикулу, марке автомобиля или VIN..."
            className="pr-10"
            leftIcon={<span>🔍</span>}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
        >
          Найти
        </button>
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-dropdown"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                Поиск...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wide">
                  Результаты поиска
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    onClick={() => handleSelect(suggestion)}
                    className={cn(
                      'w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors',
                      selectedIndex === index && 'bg-gray-50',
                    )}
                  >
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{suggestion.text}</p>
                      {suggestion.subtext && (
                        <p className="text-sm text-gray-500 truncate">{suggestion.subtext}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {searchTypes.find((t) => t.key === suggestion.type)?.label}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
            )}

            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-3">
                {searchTypes.map((type) => (
                  <span key={type.key} className="flex items-center gap-1">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">
                  Enter
                </kbd>
                <span>выбрать</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
