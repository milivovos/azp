import type { Meta, StoryObj } from '@storybook/react';
import { VinDecoderInput } from './vin-decoder-input';

const meta: Meta<typeof VinDecoderInput> = {
  title: 'Parts/VinDecoderInput',
  component: VinDecoderInput,
};

export default meta;
type Story = StoryObj<typeof VinDecoderInput>;

export const Default: Story = {
  args: { defaultValue: 'KM8J3' },
};

export const Loading: Story = {
  args: { scanning: true, defaultValue: 'KM8J3CA4-2JU-1234-5' },
};

export const Empty: Story = {
  args: { defaultValue: '' },
};

export const Error: Story = {
  render: () => <VinDecoderInput defaultValue="AAAAAAAAAAAAAAAAA" />,
};

export const HoverFocus: Story = {
  render: () => (
    <div className="space-y-4">
      <VinDecoderInput defaultValue="KM8J33A2-0GU-1234-5" />
      <VinDecoderInput
        defaultValue="FOCUS"
        className="[&_input]:ring-2 [&_input]:ring-primary/50"
      />
    </div>
  ),
};
