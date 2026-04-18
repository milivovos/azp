import React from 'react';
import type { Preview } from '@storybook/react';
import type { ReactElement } from 'react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true, // для Next 13+ App Router
    },
    layout: 'padded',
    backgrounds: {
      default: 'surface',
      values: [{ name: 'surface', value: '#FFFFFF' }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story): ReactElement => (
      <NuqsTestingAdapter searchParams="" hasMemory>
        <div className="min-h- bg-white text-gray-900 antialiased">
          <Story />
        </div>
      </NuqsTestingAdapter>
    ),
  ],
};

export default preview;
