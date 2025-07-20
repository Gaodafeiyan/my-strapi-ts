import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // 启动Strapi
  await import('../src/index');
});

afterAll(async () => {
  // 清理资源，但不强制退出
  console.log('🧹 测试清理完成');
}); 