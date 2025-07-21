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

  // 处理推荐奖励（按被邀请人档位计算比例，按邀请人档位限制投资金额）
  if (order.user.invitedBy) {
    const referralProfit = await calculateReferralRewardByInviterLevel(order.user.invitedBy, principal, staticProfit, plan.planCode);
    
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
          staticProfit: staticProfit, // 添加静态收益
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

// 计算推荐奖励（统一公式 - 只看邀请人档位）
async function calculateReferralRewardByInviterLevel(inviterId: number, inviteePrincipal: number, inviteeStaticProfit: number, inviteePlanCode: string): Promise<number> {
  // 1) 查邀请人最高档位
  const inviterOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
    filters: {
      user: inviterId,
      state: { $in: ['active', 'redeemed'] } // 只计算活跃和已赎回的订单
    } as any,
    populate: ['plan'],
    sort: { principalUSDT: 'desc' }, // 按投资金额降序排列
    limit: 1
  });

  if (!inviterOrders || inviterOrders.length === 0) {
    return 0; // 邀请人没有投资记录，不获得奖励
  }

  const inviterOrder = inviterOrders[0] as any;
  const inviterPlanCode = inviterOrder.plan.planCode;
  const inviterPrincipal = inviterOrder.principalUSDT;

  // 2) 根据邀请人档位确定收益率和返佣比例
  let inviterStaticRate = 0;
  let inviterReferralRate = 0;
  
  switch (inviterPlanCode) {
    case 'PLAN500':
      inviterStaticRate = 0.06; // 6%
      inviterReferralRate = 1.0; // 100%
      break;
    case 'PLAN1K':
      inviterStaticRate = 0.07; // 7%
      inviterReferralRate = 0.9; // 90%
      break;
    case 'PLAN2K':
      inviterStaticRate = 0.08; // 8%
      inviterReferralRate = 0.8; // 80%
      break;
    case 'PLAN5K':
      inviterStaticRate = 0.10; // 10%
      inviterReferralRate = 0.7; // 70%
      break;
    default:
      return 0;
  }

  // 3) 计算推荐奖励：min(被邀请人本金, 邀请人本金) × 邀请人静态收益率 × 邀请人返佣比例
  const limitedPrincipal = Math.min(inviteePrincipal, inviterPrincipal);
  const referralReward = Math.round(limitedPrincipal * inviterStaticRate * inviterReferralRate);

  return referralReward;
}

// 添加AI Token到用户钱包
export async function addAIToken(userId: number, amount: number, txData: any) {
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
      wallet_status: 'success',
      memo: txData.description,
    } as any,
  });
}
