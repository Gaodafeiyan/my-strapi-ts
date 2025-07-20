import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::subscription-order.subscription-order', ({ strapi }) => ({
  // 创建认购订单
  async createOrder(userId: number, planId: number) {
    const plan = await strapi.query('api::subscription-plan.subscription-plan').findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('认购计划不存在');
    }

    // 检查用户余额
    const wallet = await strapi.service('api::wallet-balance.wallet-balance').getMyBalance(userId);
    if (wallet.usdt < plan.principal) {
      throw new Error('余额不足');
    }

    // 检查购买次数限制
    const existingOrders = await strapi.query('api::subscription-order.subscription-order').findMany({
      where: {
        user: userId,
        plan: planId,
        state: 'active',
      },
    });

    if (existingOrders.length >= plan.maxBuy) {
      throw new Error('已达到该计划最大购买次数');
    }

    // 扣除用户余额
    await strapi.service('api::wallet-balance.wallet-balance').add(userId, -plan.principal, {
      txType: 'subscription',
      direction: 'out',
      amount: plan.principal,
    });

    // 计算结束时间
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + plan.cycle * 24 * 60 * 60 * 1000);

    // 创建订单
    const order = await strapi.query('api::subscription-order.subscription-order').create({
      data: {
        plan: planId,
        user: userId,
        principal: plan.principal,
        startAt,
        endAt,
        state: 'active',
      },
      populate: ['plan', 'user'],
    });

    return order;
  },

  // 赎回订单（Cron 任务调用）
  async redeemExpiredOrders() {
    const now = new Date();
    
    // 查找已过期的活跃订单
    const expiredOrders = await strapi.query('api::subscription-order.subscription-order').findMany({
      where: {
        state: 'active',
        endAt: {
          $lte: now,
        },
      },
      populate: ['plan', 'user'],
    });

    for (const order of expiredOrders) {
      try {
        await this.redeemOrder(order);
      } catch (error) {
        strapi.log.error(`赎回订单失败 ${order.id}:`, error);
      }
    }

    return expiredOrders.length;
  },

  // 赎回单个订单
  async redeemOrder(order: any) {
    const { plan, user } = order;
    
    // 计算静态收益
    const staticYield = new Decimal(plan.principal).mul(plan.staticPct).div(100);
    
    // 计算 AI Token 数量
    const aiTokenQty = new Decimal(plan.principal).mul(plan.aiPct).div(100);
    
    // 返还本金 + 静态收益
    await strapi.service('api::wallet-balance.wallet-balance').add(user.id, plan.principal + staticYield.toNumber(), {
      txType: 'subscription',
      direction: 'in',
      amount: plan.principal + staticYield.toNumber(),
    });
    
    // 添加 AI Token
    await strapi.service('api::wallet-balance.wallet-balance').add(user.id, aiTokenQty.toNumber(), {
      txType: 'aiToken',
      direction: 'in',
      amount: aiTokenQty.toNumber(),
    });
    
    // 添加抽奖次数
    await strapi.service('api::wallet-balance.wallet-balance').add(user.id, plan.spinQuota, {
      txType: 'spinQuota',
      direction: 'in',
      amount: plan.spinQuota,
    });
    
    // 更新订单状态
    await strapi.query('api::subscription-order.subscription-order').update({
      where: { id: order.id },
      data: {
        state: 'finished',
        staticYieldAcc: staticYield.toNumber(),
        aiTokenQty: aiTokenQty.toNumber(),
        spinQuota: plan.spinQuota,
        redeemedAt: new Date(),
      },
    });
    
    // 处理推荐奖励
    if (user.invitedBy) {
      const referralReward = staticYield.mul(plan.referralPct).div(100);
      
      await strapi.service('api::wallet-balance.wallet-balance').add(user.invitedBy.id, referralReward.toNumber(), {
        txType: 'referral',
        direction: 'in',
        amount: referralReward.toNumber(),
      });
      
      // 创建推荐奖励记录
      await strapi.query('api::referral-reward.referral-reward').create({
        data: {
          referrer: user.invitedBy.id,
          fromUser: user.id,
          fromOrder: order.id,
          amount: referralReward.toNumber(),
        },
      });
    }
  },
})); 