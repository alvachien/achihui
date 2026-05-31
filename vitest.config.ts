import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
