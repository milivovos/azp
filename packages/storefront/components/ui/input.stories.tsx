import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'DS/Input',
  component: Input,
  args: { placeholder: 'Поиск…' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Loading: Story = {
  render: () => (
    <div className="pointer-events-none space-y-2 opacity-70" aria-busy="true">
      <div className="h-11 animate-pulse rounded-md bg-gray-100" />
      <p className="text-xs text-gray-500">Загрузка поля…</p>
    </div>
  ),
};

export const Empty: Story = {
  args: { placeholder: '', 'aria-label': 'Пустой ввод' },
};

export const Error: Story = {
  args: { error: 'Некорректное значение', defaultValue: 'bad' },
};

export const HoverFocus: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input defaultValue="Наведите курсор" className="hover:border-gray-300" />
      <Input defaultValue="Симуляция фокуса" className="ring-2 ring-primary/50" readOnly />
    </div>
  ),
};
