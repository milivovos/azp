'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/parts';

interface CategoryNavTreeProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

interface CategoryNode extends Category {
  children?: CategoryNode[];
}

function buildTree(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();

  categories.forEach((cat) => {
    categoryMap.set(cat.name, { ...cat, children: [] });
  });

  return Array.from(categoryMap.values());
}

const categoryIcons: Record<string, string> = {
  Yağlar: '🛢️',
  'Fren sistemi': '🛑',
  Elektrik: '⚡',
  'Asqı sistemi': '🔧',
  Təkərlər: '🔘',
  Filtrlər: '🔲',
  'Soyutma sistemi': '❄️',
  Mühərrik: '⚙️',
};

function CategoryIcon({ name }: { name: string }) {
  const icon = categoryIcons[name] || '📦';
  return (
    <span
      className={cn(
        'w-8 h-8 flex items-center justify-center text-lg transition-colors',
        'group-hover:bg-primary/10 group-hover:text-primary',
      )}
    >
      {icon}
    </span>
  );
}

export function CategoryNavTree({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryNavTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(categories), [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return tree;

    const query = searchQuery.toLowerCase();
    return tree.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.subcategories?.some((sub) => sub.toLowerCase().includes(query)),
    );
  }, [tree, searchQuery]);

  const toggleExpanded = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Input
        placeholder="Поиск по каталогу..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<span>🔍</span>}
      />

      <nav className="space-y-1">
        {filteredCategories.map((category) => (
          <div key={category.name} className="group">
            <button
              onClick={() => {
                if (category.subcategories && category.subcategories.length > 0) {
                  toggleExpanded(category.name);
                }
                onSelectCategory?.(category.name);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150',
                'hover:bg-gray-50',
                selectedCategory === category.name && 'bg-primary-light text-primary',
              )}
            >
              <CategoryIcon name={category.name} />
              <span className="flex-1 text-left text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {highlightMatch(category.name, searchQuery)}
              </span>
              <div className="flex items-center gap-2">
                {category.subcategories && category.subcategories.length > 0 && (
                  <motion.span
                    animate={{ rotate: expandedCategories.has(category.name) ? 90 : 0 }}
                    className="text-gray-400"
                  >
                    ▶
                  </motion.span>
                )}
                <span className="text-xs text-gray-400">{category.count}</span>
              </div>
            </button>

            <AnimatePresence>
              {expandedCategories.has(category.name) && category.subcategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-11"
                >
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => onSelectCategory?.(sub)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded',
                        selectedCategory === sub && 'text-primary bg-primary-light',
                      )}
                    >
                      {highlightMatch(sub, searchQuery)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Категории не найдены</p>
        </div>
      )}
    </div>
  );
}
