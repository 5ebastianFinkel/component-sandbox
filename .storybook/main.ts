import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/vue3-vite",
    "options": {}
  },
  viteFinal: async (config) => {
    // Add React JSX support for MDX files
    config.esbuild = {
      ...config.esbuild,
      jsx: 'automatic'
    };
    
    config.define = {
      ...config.define,
      global: 'globalThis'
    };
    
    return config;
  }
};
export default config;