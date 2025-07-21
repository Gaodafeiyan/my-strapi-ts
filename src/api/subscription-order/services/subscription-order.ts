/**
 * subscription-order service
 */

import { OrderState, PlanCode } from '../../../shared/enums';
import { addUSDT } from '../../wallet-balance/services/wallet-balance';

export async function createOrder(userId: number, planCode: string) {
  // 读取计划
  const plan = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
    filters: { planCode: planCode } as any,
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
  const principal = selectedPlan.principalUSDT;

  if (userWallet.usdtBalance < principal) {
    throw new Error('Insufficient balance');
  }

  // 扣除用户余额
  await addUSDT(userId, -principal, {
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
      principalUSDT: principal,
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

  if ((order as any).user.id !== userId) {
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
  const principal = order.principalUSDT;

  // 计算静态收益（使用整数计算，避免浮点数精度问题）
  // 例如：500 * 6% = 500 * 6 / 100 = 30
  const staticProfit = Math.round(principal * plan.staticPct / 100);
  
  // 计算AI Token奖励（整数计算）
  const tokenBonusAmount = Math.round(principal * plan.tokenBonusPct / 100);

  // 给用户添加静态收益
  await addUSDT(userId, staticProfit, {
    type: 'subscription_redeem',
    direction: 'in',
    amount: staticProfit,
    description: `Static profit from ${plan.planCode}`,
  });

  // 添加AI Token奖励到用户钱包
  if (tokenBonusAmount > 0) {
    await addAIToken(userId, tokenBonusAmount, {
      type: 'subscription_redeem',
      direction: 'in',
      amount: tokenBonusAmount,
      description: `AI Token bonus from ${plan.planCode}`,
    });
  }

  // 处理推荐奖励（按档位不同比例）
  if (order.user.invitedBy) {
    const referralProfit = calculateReferralReward(plan.planCode, staticProfit);
    
    if (referralProfit > 0) {
      await addUSDT(order.user.invitedBy, referralProfit, {
        type: 'referral_reward',
        direction: 'in',
        amount: referralProfit,
        description: `Referral reward from ${order.user.username} (${plan.planCode})`,
      });

      // 创建推荐奖励记录
      await strapi.entityService.create('api::referral-reward.referral-reward', {
        data: {
          referrer: order.user.invitedBy,
          fromUser: userId,
          order: order.id,
          amountUSDT: referralProfit,
          description: `Referral reward from ${order.user.username} (${plan.planCode})`,
        } as any,
      });
    }
  }

  // 更新订单状态，标记抽奖次数已发放
  await strapi.entityService.update('api::subscription-order.subscription-order', order.id, {
    data: {
      state: 'redeemed',
      spinQuotaGranted: true,
      tokenBonusAmount: tokenBonusAmount,
    } as any,
  });
}

// 计算推荐奖励（按档位不同比例）
function calculateReferralReward(planCode: string, staticProfit: number): number {
  switch (planCode) {
    case 'PLAN500':
      return staticProfit; // 100% 推荐奖励
    case 'PLAN1K':
      return Math.round(staticProfit * 0.9); // 90% 推荐奖励
    case 'PLAN2K':
      return Math.round(staticProfit * 0.8); // 80% 推荐奖励
    case 'PLAN5K':
      return Math.round(staticProfit * 0.7); // 70% 推荐奖励
    default:
      return 0;
  }
}

// 添加AI Token到用户钱包
async function addAIToken(userId: number, amount: number, txData: any) {
  // 更新用户钱包的AI Token余额
  const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
    filters: { user: userId } as any,
  });

  if (wallet && wallet.length > 0) {
    const userWallet = wallet[0];
    const newBalance = userWallet.aiTokenBalance + amount;
    
    await strapi.entityService.update('api::wallet-balance.wallet-balance', userWallet.id, {
      data: { aiTokenBalance: newBalance } as any,
    });
  }

  // 创建钱包交易记录
  await strapi.entityService.create('api::wallet-tx.wallet-tx', {
    data: {
      user: userId,
      tx_type: 'subscription_redeem',
      direction: 'in',
      amountUSDT: 0,
      amountToken: amount,
      memo: txData.description,
    } as any,
  });
}
