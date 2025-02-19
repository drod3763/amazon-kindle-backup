import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Browser options
    headless: false,
    permissions: ['geolocation', 'notifications', 'camera', 'microphone', 'bluetooth'],

    // Context options
    acceptDownloads: true,
  },
});