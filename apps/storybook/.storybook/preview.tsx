import { UIProvider } from '@repo/ui/components/ui-provider';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';

import '@repo/ui/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: {
          theme: 'light',
          className: 'light',
        },
        dark: {
          theme: 'dark',
          className: 'dark',
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => {
      return (
        <div className="bg-background">
          <UIProvider>
            <Story />
          </UIProvider>
        </div>
      );
    },
  ],
};

export default preview;
