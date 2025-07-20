import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Investment Platform E2E Tests', () => {
  let userA: any;
  let userB: any;
  let order: any;

  beforeAll(async () => {
    // 清理测试数据
    const testUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { email: { $contains: 'test' } } as any,
    });
    
    for (const user of testUsers) {
      await strapi.entityService.delete('plugin::users-permissions.user', user.id);
    }
  });

  afterAll(async () => {
    // 清理测试数据
    const testUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { email: { $contains: 'test' } } as any,
    });
    
    for (const user of testUsers) {
      await strapi.entityService.delete('plugin::users-permissions.user', user.id);
    }
  });

  it('should complete full investment flow', async () => {
    // 1. 注册用户A（无上级）
    const userAData = {
      email: 'test.userA@example.com',
      password: 'password123',
      username: 'testUserA',
    };

    userA = await strapi.entityService.create('plugin::users-permissions.user', {
      data: userAData,
    });

    expect(userA).toBeDefined();
    expect(userA.diamondId).toBeDefined();
    expect(userA.referralCode).toBeDefined();

    // 2. 注册用户B（使用A的邀请码）
    const userBData = {
      email: 'test.userB@example.com',
      password: 'password123',
      username: 'testUserB',
      inviteCode: userA.referralCode,
    };

    userB = await strapi.entityService.create('plugin::users-permissions.user', {
      data: userBData,
    });

    expect(userB).toBeDefined();
    expect(userB.invitedBy).toBe(userA.id);

    // 3. 给用户B充值500 USDT
    const walletB = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
      filters: { user: userB.id } as any,
    });

    await strapi.entityService.update('api::wallet-balance.wallet-balance', walletB[0].id, {
      data: { usdtBalance: 500 },
    });

    // 4. B购买PLAN500
    const plan = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
      filters: { planCode: 'PLAN500' } as any,
    });

    order = await strapi.entityService.create('api::subscription-order.subscription-order', {
      data: {
        user: userB.id,
        plan: plan[0].id,
        principalUSDT: 500,
        state: 'active',
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        spinQuotaGranted: false,
      } as any,
    });

    expect(order).toBeDefined();
    expect(order.state).toBe('active');

    // 5. 模拟赎回（直接调用service）
    const { processRedeem } = await import('../src/api/subscription-order/services/subscription-order');
    await processRedeem(order);

    // 6. 验证结果
    const updatedWalletB = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
      filters: { user: userB.id } as any,
    });

    const updatedWalletA = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
      filters: { user: userA.id } as any,
    });

    const updatedOrder = await strapi.entityService.findOne('api::subscription-order.subscription-order', order.id);

    const referralRewards = await strapi.entityService.findMany('api::referral-reward.referral-reward', {
      filters: { referrer: userA.id } as any,
    });

    // 验证B的余额：500 - 500 + 30 = 30
    expect(updatedWalletB[0].usdtBalance).toBe(30);

    // 验证A的余额：0 + 30 = 30
    expect(updatedWalletA[0].usdtBalance).toBe(30);

    // 验证订单状态
    expect(updatedOrder.state).toBe('redeemed');

    // 验证推荐奖励记录
    expect(referralRewards).toHaveLength(1);
    expect(referralRewards[0].amountUSDT).toBe(30);
  });
}); 