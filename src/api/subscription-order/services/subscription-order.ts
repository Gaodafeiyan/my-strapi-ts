/**
 * subscription-order service
 */

import Decimal from 'decimal.js';
import { OrderState, PlanCode } from '../../../../shared/enums';
import { addUSDT } from '../../wallet-balance/services/wallet-balance';

export async function createOrder(userId: number, planCode: string) {
  // 读取计划
  const plan = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
    filters: { code: planCode } as any,
  });

  if (!plan || plan.length === 0) {
    throw new Error('Plan not found');
  }

  const selectedPlan = plan[0];

  // 校验用户余额
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
  });

  if (!wallet || wallet.length === 0) {
    throw new Error('Wallet not found');
  }

  const userWallet = wallet[0];
  const principal = new Decimal(selectedPlan.principalUSDT);

  if (new Decimal(userWallet.usdtBalance).lessThan(principal)) {
    throw new Error('Insufficient balance');
  }

  // 扣除用户余额
  await addUSDT(userId, principal.negated(), {
    type: 'subscription_buy',
    direction: 'out',
    amount: principal,
    description: `Purchase ${selectedPlan.planCode}`,
  });

  // 创建订单
  const now = new Date();
  const endAt = new Date(now.getTime() + selectedPlan.cycle_days * 24 * 60 * 60 * 1000);

  const order = await strapi.entityService.create('api::subscription-order.subscription-order', {
    data: {
      user: userId,
      plan: selectedPlan.id,
      principal: principal.toNumber(),
      state: 'active',
      startAt: now,
      endAt: endAt,
      spinQuotaGranted: false,
    } as any,
  });

  return order;
}

export async function findMyOrders(userId: number) {
  return await strapi.entityService.findMany('api::subscription-order.subscription-order', {
    filters: { user: userId } as any,
    populate: ['plan'],
    sort: { createdAt: 'desc' },
  });
}

export async function redeemOrder(orderId: number, userId: number) {
  const order = await strapi.entityService.findOne('api::subscription-order.subscription-order', orderId, {
    populate: ['plan', 'user'],
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  if (order.state !== 'active') {
    throw new Error('Order is not active');
  }

  const now = new Date();
  if (now < order.endAt) {
    throw new Error('Order is not due yet');
  }

  // 执行赎回逻辑
  await processRedeem(order);
}

export async function processRedeem(order: any) {
  const plan = order.plan;
  const userId = order.user.id;
  const principal = new Decimal(order.principal);

  // 计算静态收益
  const staticProfit = principal.times(plan.staticPct / 100);
  const bonusToken = new Decimal(plan.bonusToken || 0);

  // 给用户添加收益
  await addUSDT(userId, staticProfit, {
    type: 'subscription_redeem',
    direction: 'in',
    amount: staticProfit,
    description: `Static profit from ${plan.name}`,
  });

  // 添加奖励代币
  if (bonusToken.greaterThan(0)) {
    // 这里需要调用addToken，但我们需要先创建这个函数
    // await addToken(userId, bonusToken, {
    //   type: 'subscription_redeem',
    //   direction: 'in',
    //   amount: bonusToken,
    //   description: `Bonus token from ${plan.name}`,
    // });
  }

  // 处理推荐奖励
  if (order.user.invitedBy) {
    const referralProfit = staticProfit.times(plan.referralPct / 100);
    
    await addUSDT(order.user.invitedBy, referralProfit, {
      type: 'referral_reward',
      direction: 'in',
      amount: referralProfit,
      description: `Referral reward from ${order.user.username}`,
    });

    // 创建推荐奖励记录
    await strapi.entityService.create('api::referral-reward.referral-reward', {
      data: {
        referrer: order.user.invitedBy,
        fromUser: userId,
        order: order.id,
        amount: referralProfit.toNumber(),
        description: `Referral reward from ${order.user.username}`,
      } as any,
    });
  }

  // 更新订单状态
  await strapi.entityService.update('api::subscription-order.subscription-order', order.id, {
    data: {
      state: 'redeemed',
      spinQuotaGranted: true,
    } as any,
  });
}
