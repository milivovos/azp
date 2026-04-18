import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { UniversalSearchResult } from '@/app/actions/universal-search';
import { UniversalSearchBar } from './universal-search-bar';

async function mockSearch(query: string): Promise<UniversalSearchResult> {
  const q = query.trim();
  await new Promise((r) => setTimeout(r, 120));
  if (!q) return { articles: [], vehicles: [], vins: [] };
  return {
    articles: [
      { id: 'a', label: `PART-${q.toUpperCase()}`, sublabel: 'Деталь', group: 'articles' },
    ],
    vehicles: [{ id: 'v', label: 'HYUNDAI Genesis', sublabel: '2008–2016', group: 'vehicles' }],
    vins: [{ id: 'vin', label: 'KMHGH4JH2EU123456', sublabel: 'VIN', group: 'vins' }],
  };
}

const meta: Meta<typeof UniversalSearchBar> = {
  title: 'Parts/UniversalSearchBar',
  component: UniversalSearchBar,
};

export default meta;
type Story = StoryObj<typeof UniversalSearchBar>;

export const Default: Story = {
  render: () => {
    const [sel, setSel] = useState('');
    return (
      <div className="w-full max-w-xl space-y-2">
        <UniversalSearchBar searchRunner={mockSearch} onSelect={(h) => setSel(h.label)} />
        {sel && <p className="text-xs text-gray-500">Выбрано: {sel}</p>}
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <UniversalSearchBar
      searchRunner={() => new Promise<UniversalSearchResult>(() => {})}
      placeholder="Загрузка…"
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <UniversalSearchBar
      searchRunner={async () => ({ articles: [], vehicles: [], vins: [] })}
      placeholder="Пустой ответ"
    />
  ),
};

export const SearchError: Story = {
  render: () => (
    <UniversalSearchBar
      searchRunner={async () => {
        throw new Error('fail');
      }}
    />
  ),
};

function HoverFocusDemo() {
  return (
    <div className="w-full max-w-xl space-y-4">
      <p className="text-xs text-gray-500">
        Кликните в поле — focus ring; наведите на опции в списке.
      </p>
      <UniversalSearchBar searchRunner={mockSearch} />
    </div>
  );
}

export const HoverFocus: Story = {
  render: () => <HoverFocusDemo />,
};
