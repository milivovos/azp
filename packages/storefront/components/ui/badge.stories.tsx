import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'DS/Badge',
  component: Badge,
  args: { children: 'Статус' },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Loading: Story = {
  render: () => (
    <div className="inline-flex h-7 w-20 animate-pulse rounded-full bg-gray-100" aria-busy="true" />
  ),
};

export const Empty: Story = {
  render: () => <Badge className="min-w-[2rem] opacity-40">&nbsp;</Badge>,
};

export const Error: Story = {
  args: { variant: 'error', children: 'Ошибка' },
};

export const HoverFocus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge className="cursor-default ring-2 ring-primary/40">Акцент</Badge>
      <Badge variant="primary" dot>
        С точкой
      </Badge>
    </div>
  ),
};
