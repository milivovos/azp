import type { Meta, StoryObj } from '@storybook/react';
import { VehicleSelector } from './vehicle-selector';

const meta: Meta<typeof VehicleSelector> = {
  title: 'Parts/VehicleSelector',
  component: VehicleSelector,
};

export default meta;
type Story = StoryObj<typeof VehicleSelector>;

export const Default: Story = {};

export const Loading: Story = {
  render: () => (
    <div className="max-w-lg space-y-3 rounded-xl border border-gray-100 p-4" aria-busy="true">
      <div className="h-2 animate-pulse rounded-full bg-gray-100" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="max-w-lg rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
      Нет доступных марок для вашего региона
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Не удалось загрузить каталог ТС
    </div>
  ),
};

export const HoverFocus: Story = {
  render: () => (
    <div className="max-w-lg">
      <VehicleSelector />
      <p className="mt-4 text-xs text-gray-500">
        Сфокусируйте кнопки шагов с Tab — видно кольцо focus-visible.
      </p>
    </div>
  ),
};
