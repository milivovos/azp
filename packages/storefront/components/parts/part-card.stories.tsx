import type { Meta, StoryObj } from '@storybook/react';
import { PartCard } from './part-card';
import { MOCK_PART } from '../../.storybook/parts-mocks';

const meta: Meta<typeof PartCard> = {
  title: 'Parts/PartCard',
  component: PartCard,
};

export default meta;
type Story = StoryObj<typeof PartCard>;

export const Default: Story = {
  args: {
    part: MOCK_PART,
    onAddToCart: async () => {
      await new Promise((r) => setTimeout(r, 400));
    },
  },
};

export const Loading: Story = {
  args: { loading: true, layout: 'detailed' },
};

export const Empty: Story = {
  args: { empty: true },
};

export const Error: Story = {
  args: { error: 'Карточка не загрузилась. Повторите позже.' },
};

export const HoverFocus: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4 sm:grid-cols-1">
      <PartCard
        part={MOCK_PART}
        className="hover:-translate-y-1 hover:border-l-[3px] hover:border-l-primary"
        onAddToCart={async () => new Promise((r) => setTimeout(r, 200))}
      />
      <PartCard
        part={{ ...MOCK_PART, id: 'p2' }}
        className="ring-2 ring-primary/50"
        onAddToCart={async () => {}}
      />
    </div>
  ),
};

export const Compact: Story = {
  args: {
    layout: 'compact',
    part: MOCK_PART,
    onAddToCart: async () => {},
  },
};
