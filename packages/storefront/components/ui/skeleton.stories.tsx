import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'DS/Skeleton',
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-12 w-full max-w-md" />,
};

export const Loading: Story = {
  render: () => <SkeletonList count={4} />,
};

export const Empty: Story = {
  render: () => (
    <p className="text-sm text-gray-500">Нет контента для скелетона — пустое состояние секции.</p>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Ошибка загрузки блока
    </div>
  ),
};

export const HoverFocus: Story = {
  render: () => (
    <div className="max-w-md space-y-2">
      <Skeleton className="h-10 w-full ring-2 ring-primary/30" />
      <SkeletonCard />
    </div>
  ),
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const Table: Story = {
  render: () => <SkeletonTable rows={4} cols={3} />,
};
