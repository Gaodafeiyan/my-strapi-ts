import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // 启动Strapi
  await import('../src/index');
});

afterAll(async () => {
  // 清理资源
  process.exit(0);
}); 