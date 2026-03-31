import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 300000,

  use: {
    headless: false,
  },

  globalTeardown: require.resolve('./globalTeardown'),
});
