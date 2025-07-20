/**
 * wallet-balance controller
 */

import { getWalletBalance } from '../services/wallet-balance';

export default {
  async findMine(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const wallet = await getWalletBalance(userId);
      return wallet;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getAddr(ctx) {
    const userId = ctx.state.user.id;
    
    // 这里可以返回用户的充值地址
    // 暂时返回一个模拟地址
    return {
      address: 'TRC20_USDT_ADDRESS_HERE',
      network: 'TRC20',
      memo: `User_${userId}`,
    };
  },
};
