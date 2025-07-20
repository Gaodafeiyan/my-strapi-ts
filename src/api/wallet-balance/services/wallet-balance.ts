import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::wallet-balance.wallet-balance', ({ strapi }) => ({
  // 获取用户钱包余额
  async getMyBalance(userId: number) {
    let wallet = await strapi.query('api::wallet-balance.wallet-balance').findOne({
      where: { user: userId },
      populate: ['user'],
    });

    if (!wallet) {
      // 如果钱包不存在，创建默认钱包
      wallet = await strapi.query('api::wallet-balance.wallet-balance').create({
        data: {
          user: userId,
          usdt: 0,
          aiToken: 0,
          spinQuota: 0,
        },
        populate: ['user'],
      });
    }

    return wallet;
  },

  // 获取用户充值地址（占位实现）
  async getDepositAddress(userId: number) {
    // 简单的地址生成逻辑，实际应该使用热钱包
    const address = `0x${userId.toString().padStart(40, '0')}`;
    return { address };
  },

  // 添加余额（统一入口）
  async add(userId: number, delta: number, meta: any = {}) {
    const { txType, direction, amount } = meta;
    
    // 使用 decimal.js 进行精确计算
    const decimalDelta = new Decimal(delta);
    
    // 获取或创建钱包
    let wallet = await strapi.query('api::wallet-balance.wallet-balance').findOne({
      where: { user: userId },
    });

    if (!wallet) {
      wallet = await strapi.query('api::wallet-balance.wallet-balance').create({
        data: {
          user: userId,
          usdt: 0,
          aiToken: 0,
          spinQuota: 0,
        },
      });
    }

    // 根据交易类型更新对应余额
    let fieldToUpdate = 'usdt';
    if (txType === 'aiToken') {
      fieldToUpdate = 'aiToken';
    } else if (txType === 'spinQuota') {
      fieldToUpdate = 'spinQuota';
    }

    // 计算新余额
    const currentBalance = new Decimal(wallet[fieldToUpdate] || 0);
    const newBalance = currentBalance.plus(decimalDelta);

    // 检查余额是否足够（对于支出交易）
    if (direction === 'out' && newBalance.isNegative()) {
      throw new Error('余额不足');
    }

    // 更新钱包余额
    await strapi.query('api::wallet-balance.wallet-balance').update({
      where: { id: wallet.id },
      data: {
        [fieldToUpdate]: newBalance.toNumber(),
      },
    });

    // 创建交易记录
    await strapi.query('api::wallet-tx.wallet-tx').create({
      data: {
        txType,
        direction,
        amount: Math.abs(delta),
        status: 'success',
        meta,
        user: userId,
      },
    });

    return {
      success: true,
      newBalance: newBalance.toNumber(),
    };
  },
})); 