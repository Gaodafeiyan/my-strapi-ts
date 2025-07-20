import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // 测试环境设置
  console.log('🚀 测试环境已准备');
});

afterAll(async () => {
  // 清理资源
  console.log('🧹 测试清理完成');
}); 