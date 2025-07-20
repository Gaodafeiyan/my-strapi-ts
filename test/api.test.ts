import { describe, it, expect } from 'vitest';
import { strapi } from './setup';

describe('投资平台 API 测试', () => {
  it('应该能获取认购计划', async () => {
    const response = await strapi.request('GET', '/api/subscription-plans');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('应该能获取用户角色', async () => {
    const response = await strapi.request('GET', '/api/users-permissions/roles');
    expect(response.status).toBe(200);
    expect(response.body.roles).toBeDefined();
  });
}); 