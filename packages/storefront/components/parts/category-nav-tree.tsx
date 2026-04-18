'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Car, Cog, Disc, Search, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CategoryNavNode = {
  id: string;
  label: string;
  icon: LucideIcon;
  children?: CategoryNavNode[];
};

const DEFAULT_TREE: CategoryNavNode[] = [
  {
    id: '1',
    label: 'Кузов',
    icon: Car,
    children: [
      { id: '1-1', label: 'Бамперы', icon: Wrench },
      { id: '1-2', label: 'Крылья', icon: Wrench },
    ],
  },
  {
    id: '2',
    label: 'Двигатель',
    icon: Cog,
    children: [
      { id: '2-1', label: 'Фильтры', icon: Disc },
      { id: '2-2', label: 'Ремни', icon: Disc },
    ],
  },
];

function highlight(text: string, q: string): ReactNode {
  if (!q.trim()) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}
      <mark className="rounded-sm bg-primary-light px-0.5 text-gray-900">{match}</mark>
      {after}
    </>
  );
}

function NavItem({
  node,
  depth,
  query,
  expanded,
  toggle,
  onSelect,
}: {
  node: CategoryNavNode;
  depth: number;
  query: string;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const open = expanded.has(node.id);
  const Icon = node.icon;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-stretch gap-ds-1">
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => toggle(node.id)}
            className="group flex min-h-[44px] flex-1 items-center gap-ds-2 rounded-md px-ds-2 text-left text-sm text-gray-800 transition-colors duration-base ease-motion-base hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Icon
              className="h-4 w-4 shrink-0 text-gray-500 transition-colors duration-base group-hover:text-primary"
              strokeWidth={1.75}
            />
            <span className="group flex min-w-0 flex-1 items-center gap-ds-2">
              <span className="truncate group-hover:text-primary">
                {highlight(node.label, query)}
              </span>
            </span>
            <span className="text-xs text-gray-400">{open ? '−' : '+'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect?.(node.id)}
            className="group flex min-h-[44px] w-full items-center gap-ds-2 rounded-md px-ds-2 text-left text-sm transition-colors duration-base ease-motion-base hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Icon
              className="h-4 w-4 shrink-0 text-gray-500 transition-colors duration-base group-hover:text-primary"
              strokeWidth={1.75}
            />
            <span className="truncate group-hover:text-primary">
              {highlight(node.label, query)}
            </span>
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {node.children!.map((ch) => (
              <NavItem
                key={ch.id}
                node={ch}
                depth={depth + 1}
                query={query}
                expanded={expanded}
                toggle={toggle}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function filterTree(nodes: CategoryNavNode[], q: string): CategoryNavNode[] {
  if (!q.trim()) return nodes;
  const lower = q.toLowerCase();
  const walk = (n: CategoryNavNode): CategoryNavNode | null => {
    const selfMatch = n.label.toLowerCase().includes(lower);
    const kids = n.children?.map(walk).filter(Boolean) as CategoryNavNode[] | undefined;
    if (selfMatch) return { ...n, children: n.children };
    if (kids?.length) return { ...n, children: kids };
    return null;
  };
  return nodes.map(walk).filter(Boolean) as CategoryNavNode[];
}

export type CategoryNavTreeProps = {
  className?: string;
  tree?: CategoryNavNode[];
  onSelect?: (id: string) => void;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
};

export function CategoryNavTree({
  className,
  tree = DEFAULT_TREE,
  onSelect,
  loading,
  empty,
  error,
}: CategoryNavTreeProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(tree.map((t) => t.id)));

  const visible = useMemo(() => filterTree(tree, query), [tree, query]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-amber-50/60 p-ds-4 text-sm text-amber-900',
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-100 bg-white p-ds-6 text-center text-sm text-gray-500',
          className,
        )}
      >
        Категории недоступны
      </div>
    );
  }

  return (
    <nav
      className={cn(
        'w-full max-w-sm rounded-xl border border-gray-100 bg-white p-ds-3 shadow-sm',
        className,
      )}
      aria-label="Категории запчастей"
    >
      <div className="relative mb-ds-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по дереву"
          className="min-h-[44px] w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm transition-colors duration-fast ease-motion-fast placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      {loading ? (
        <div className="space-y-2 p-ds-2" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-ds-1">
          {visible.map((n) => (
            <NavItem
              key={n.id}
              node={n}
              depth={0}
              query={query}
              expanded={expanded}
              toggle={toggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </nav>
  );
}
