/**
 * usdt-withdraw controller
 */

import { addUSDT } from '../../wallet-balance/services/wallet-balance';

export default {
  async create(ctx) {
    const { amount, address, network } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      // 确保所有金额都是整数
      const withdrawAmount = Math.round(amount);

      // 检查余额
      const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
        filters: { user: userId } as any,
      });

      if (!wallet || wallet.length === 0) {
        return ctx.badRequest('Wallet not found');
      }

      const userWallet = wallet[0];
      if (userWallet.usdtBalance < withdrawAmount) {
        return ctx.badRequest('Insufficient balance');
      }

      // 立即扣除余额（虚拟USDT）
      await addUSDT(userId, -withdrawAmount, {
        type: 'usdt_withdraw',
        direction: 'out',
        amount: withdrawAmount,
        description: `Withdraw ${withdrawAmount} USDT to ${address}`,
      });

      // 创建提现记录（待审核状态）
      const withdraw = await strapi.entityService.create('api::usdt-withdraw.usdt-withdraw', {
        data: {
          user: userId,
          amount: withdrawAmount,
          fee: 0, // 移除手续费
          address,
          network,
          status: 'pending', // 等待后台审核
        } as any,
      });

      return {
        ...withdraw,
        message: '提现申请已提交，等待后台审核'
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async findMine(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const withdraws = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw', {
        filters: { user: userId } as any,
        sort: { createdAt: 'desc' },
      });
      return withdraws;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 管理员审核提现（通过/拒绝）
  async confirm(ctx) {
    const { id } = ctx.params;
    const { status, txHash, rejectReason } = ctx.request.body;

    try {
      const withdraw = await strapi.entityService.findOne('api::usdt-withdraw.usdt-withdraw', parseInt(id), {
        populate: ['user'],
      });

      if (!withdraw) {
        return ctx.badRequest('Withdraw record not found');
      }

      if (status === 'rejected') {
        // 如果拒绝，退还用户余额
        await addUSDT((withdraw as any).user.id, (withdraw as any).amountUSDT, {
          type: 'usdt_withdraw',
          direction: 'in',
          amount: (withdraw as any).amountUSDT,
          description: `Withdraw refund: ${rejectReason || 'Rejected by admin'}`,
        });
      }

      await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw', parseInt(id), {
        data: {
          status: status,
          txHash: txHash || null,
          rejectReason: rejectReason || null,
          reviewedAt: new Date(),
        } as any,
      });

      return { 
        success: true,
        message: status === 'approved' ? '提现已通过' : '提现已拒绝'
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 获取所有提现记录（管理员用）
  async findAll(ctx) {
    try {
      const withdraws = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw', {
        populate: ['user'],
        sort: { createdAt: 'desc' },
      });
      return withdraws;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
