'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { universalSearchAction, type UniversalSearchResult } from '@/app/actions/universal-search';
import type { UniversalSearchHit, SearchGroup } from '@/types/parts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const DEBOUNCE_MS = 300;

const GROUP_LABEL: Record<SearchGroup, string> = {
  articles: 'Артикулы',
  vehicles: 'Авто',
  vins: 'VIN',
};

function groupHits(groups: {
  articles: UniversalSearchHit[];
  vehicles: UniversalSearchHit[];
  vins: UniversalSearchHit[];
}): { key: SearchGroup; items: UniversalSearchHit[] }[] {
  return (['articles', 'vehicles', 'vins'] as const)
    .map((key) => ({ key, items: groups[key] }))
    .filter((g) => g.items.length > 0);
}

export type UniversalSearchBarProps = {
  className?: string;
  placeholder?: string;
  onSelect?: (hit: UniversalSearchHit) => void;
  /** Подмена поиска (например, Storybook / тесты). По умолчанию — Server Action. */
  searchRunner?: (query: string) => Promise<UniversalSearchResult>;
};

export function UniversalSearchBar({
  className,
  placeholder = 'Артикул, модель или VIN…',
  onSelect,
  searchRunner,
}: UniversalSearchBarProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<{
    articles: UniversalSearchHit[];
    vehicles: UniversalSearchHit[];
    vins: UniversalSearchHit[];
  }>({ articles: [], vehicles: [], vins: [] });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({ articles: [], vehicles: [], vins: [] });
      setError(null);
      return;
    }
    startTransition(async () => {
      try {
        setError(null);
        const run = searchRunner ?? universalSearchAction;
        const r = await run(debounced);
        setResults(r);
      } catch {
        setError('Не удалось выполнить поиск');
      }
    });
  }, [debounced, searchRunner]);

  const flatHits = useMemo(() => {
    const g = groupHits(results);
    return g.flatMap((x) => x.items);
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debounced, results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        setOpen(true);
      }
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatHits.length - 1, 0)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && flatHits[activeIndex]) {
        e.preventDefault();
        onSelect?.(flatHits[activeIndex]!);
        setOpen(false);
      }
    },
    [activeIndex, flatHits, onSelect, open],
  );

  const grouped = groupHits(results);
  const showEmpty = open && debounced.trim() && !isPending && flatHits.length === 0 && !error;
  const showPalette = open;

  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flatHits[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          leftIcon={<Search className="h-4 w-4" aria-hidden />}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="pr-24"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 sm:inline">
          Cmd+K
        </kbd>
      </div>

      <AnimatePresence>
        {showPalette && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed inset-0 z-modal bg-black/40 sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(420px,70vh)] sm:overflow-auto sm:rounded-lg sm:border sm:border-gray-100 sm:bg-white sm:shadow-lg sm:backdrop-blur-none',
              'max-sm:z-modal',
            )}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              className={cn(
                'flex h-full flex-col bg-white sm:h-auto sm:max-h-[min(420px,70vh)]',
                'max-sm:mt-auto max-sm:max-h-[85vh] max-sm:rounded-t-xl max-sm:shadow-lg',
              )}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:hidden">
                <span className="text-sm font-medium">Поиск</span>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Закрыть"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 sm:p-2" id={listId} role="listbox" aria-label="Результаты поиска">
                {error && (
                  <p className="rounded-md bg-primary-light px-3 py-2 text-sm text-gray-800">
                    {error}
                  </p>
                )}
                {isPending && (
                  <div className="space-y-2 p-2" aria-busy="true">
                    <div className="h-10 animate-pulse rounded-md bg-gray-100" />
                    <div className="h-10 animate-pulse rounded-md bg-gray-100" />
                    <div className="h-10 animate-pulse rounded-md bg-gray-100" />
                  </div>
                )}
                {showEmpty && (
                  <p className="px-3 py-6 text-center text-sm text-gray-500">Ничего не найдено</p>
                )}
                {!isPending &&
                  grouped.map((section) => (
                    <div key={section.key} className="mb-3 last:mb-0">
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {GROUP_LABEL[section.key]}
                      </div>
                      <ul className="space-y-1">
                        {section.items.map((hit) => {
                          const globalIndex = flatHits.indexOf(hit);
                          const active = globalIndex === activeIndex;
                          return (
                            <li key={hit.id} role="presentation">
                              <button
                                id={`${listId}-${globalIndex}`}
                                type="button"
                                role="option"
                                aria-selected={active}
                                className={cn(
                                  'flex w-full min-h-[44px] flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors duration-base ease-motion-base',
                                  active ? 'bg-primary-light text-gray-900' : 'hover:bg-gray-50',
                                )}
                                onMouseEnter={() => setActiveIndex(globalIndex)}
                                onClick={() => {
                                  onSelect?.(hit);
                                  setOpen(false);
                                }}
                              >
                                <span className="font-medium">{hit.label}</span>
                                {hit.sublabel && (
                                  <span className="text-xs text-gray-500">{hit.sublabel}</span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
