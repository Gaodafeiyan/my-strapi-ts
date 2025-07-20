/**
 * usdt-withdraw controller
 */

import Decimal from 'decimal.js';
import { addUSDT } from '../../wallet-balance/services/wallet-balance';

export default {
  async create(ctx) {
    const { amount, address, network } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      const withdrawAmount = new Decimal(amount);
      const fee = new Decimal(1); // 固定手续费1 USDT
      const totalAmount = withdrawAmount.plus(fee);

      // 检查余额
      const wallet = await strapi.entityService.findMany('api::wallet-balance.wallet-balance', {
        filters: { user: userId } as any,
      });

      if (!wallet || wallet.length === 0) {
        return ctx.badRequest('Wallet not found');
      }

      const userWallet = wallet[0];
      if (new Decimal(userWallet.usdtBalance).lessThan(totalAmount)) {
        return ctx.badRequest('Insufficient balance');
      }

      // 扣除余额
      await addUSDT(userId, totalAmount.negated(), {
        type: 'usdt_withdraw',
        direction: 'out',
        amount: totalAmount,
        description: `Withdraw ${amount} USDT to ${address}`,
      });

      // 创建提现记录
      const withdraw = await strapi.entityService.create('api::usdt-withdraw.usdt-withdraw', {
        data: {
          user: userId,
          amount: withdrawAmount.toNumber(),
          fee: fee.toNumber(),
          address,
          network,
          status: 'pending',
        } as any,
      });

      return withdraw;
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

  async confirm(ctx) {
    const { id } = ctx.params;
    const { txHash } = ctx.request.body;

    try {
      await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw', parseInt(id), {
        data: {
          status: 'success',
          txHash,
        } as any,
      });

      return { success: true };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
