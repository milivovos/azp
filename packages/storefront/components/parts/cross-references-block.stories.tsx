import type { Meta, StoryObj } from '@storybook/react';
import { CrossReferencesBlock } from './cross-references-block';
import { MOCK_CROSS } from '../../.storybook/parts-mocks';

const meta: Meta<typeof CrossReferencesBlock> = {
  title: 'Parts/CrossReferencesBlock',
  component: CrossReferencesBlock,
};

export default meta;
type Story = StoryObj<typeof CrossReferencesBlock>;

export const Default: Story = {
  args: { rows: MOCK_CROSS.slice(0, 40) },
};

export const Loading: Story = {
  args: { rows: [], loading: true },
};

export const Empty: Story = {
  args: { rows: [], empty: true },
};

export const Error: Story = {
  args: { rows: [], error: 'Таблица аналогов недоступна' },
};

export const HoverFocus: Story = {
  render: () => (
    <CrossReferencesBlock rows={MOCK_CROSS.slice(0, 12)} className="ring-2 ring-primary/40" />
  ),
};
