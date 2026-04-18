import type { Meta, StoryObj } from '@storybook/react';
import { SupplierComparisonTable } from './supplier-comparison-table';
import { MOCK_SUPPLIERS } from '../../.storybook/parts-mocks';

const meta: Meta<typeof SupplierComparisonTable> = {
  title: 'Parts/SupplierComparisonTable',
  component: SupplierComparisonTable,
};

export default meta;
type Story = StoryObj<typeof SupplierComparisonTable>;

export const Default: Story = {
  args: { offers: MOCK_SUPPLIERS },
};

export const Loading: Story = {
  args: { offers: [], loading: true },
};

export const Empty: Story = {
  args: { offers: [], empty: true },
};

export const Error: Story = {
  args: { offers: [], error: 'Сравнение недоступно' },
};

export const HoverFocus: Story = {
  args: { offers: MOCK_SUPPLIERS, className: 'ring-2 ring-primary/40' },
};
