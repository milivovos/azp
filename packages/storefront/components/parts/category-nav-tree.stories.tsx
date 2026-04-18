import type { Meta, StoryObj } from '@storybook/react';
import { CategoryNavTree } from './category-nav-tree';

const meta: Meta<typeof CategoryNavTree> = {
  title: 'Parts/CategoryNavTree',
  component: CategoryNavTree,
};

export default meta;
type Story = StoryObj<typeof CategoryNavTree>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: { empty: true },
};

export const Error: Story = {
  args: { error: 'Дерево категорий недоступно' },
};

export const HoverFocus: Story = {
  render: () => <CategoryNavTree className="ring-2 ring-primary/40" />,
};
