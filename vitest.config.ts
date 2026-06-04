import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@model': path.resolve(__dirname, 'src/app/model'),
      '@uimodel': path.resolve(__dirname, 'src/app/uimodel'),
      '@services': path.resolve(__dirname, 'src/app/services'),
      '@testing': path.resolve(__dirname, 'src/testing'),
      '@environments': path.resolve(__dirname, 'src/environments'),
    },
  },
});
