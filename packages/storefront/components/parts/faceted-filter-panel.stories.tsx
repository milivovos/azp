import type { Meta, StoryObj } from '@storybook/react';
import { FacetedFilterPanel } from './faceted-filter-panel';

const meta: Meta<typeof FacetedFilterPanel> = {
  title: 'Parts/FacetedFilterPanel',
  component: FacetedFilterPanel,
};

export default meta;
type Story = StoryObj<typeof FacetedFilterPanel>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: { empty: true },
};

export const Error: Story = {
  args: { error: 'Фильтры не загрузились' },
};

export const HoverFocus: Story = {
  render: () => (
    <div className="flex gap-4">
      <FacetedFilterPanel className="ring-2 ring-primary/40" />
    </div>
  ),
};
