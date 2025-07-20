import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/setup.ts'],
    environment: 'node',
    testTimeout: 30000, // 增加超时时间
  },
}); 