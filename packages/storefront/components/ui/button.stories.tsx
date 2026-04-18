import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'DS/Button',
  component: Button,
  args: { children: 'Кнопка' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true, children: 'Сохранить' },
};

export const Empty: Story = {
  args: { children: '', 'aria-label': 'Пустая метка', size: 'icon' },
  render: (args: ComponentProps<typeof Button>) => <Button {...args} />,
};

export const Error: Story = {
  args: {
    variant: 'outline',
    className: 'border-amber-300 bg-amber-50 text-amber-900',
    children: 'Ошибка оплаты',
  },
};

export const HoverFocus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Button className="hover:-translate-y-0.5">Hover (наведите)</Button>
      <Button className="ring-2 ring-primary/50 ring-offset-2">Focus-visible</Button>
    </div>
  ),
};
