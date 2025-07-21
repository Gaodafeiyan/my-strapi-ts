/**
 * wallet-balance controller
 */

import { getWalletBalance, addUSDT } from '../services/wallet-balance';

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
    
    // 返回BEP20 BSC网络的充值地址
    return {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      network: 'BEP20',
      memo: `User_${userId}`,
    };
  },

  // 管理员充值接口
  async adminRecharge(ctx) {
    const { userId, amount } = ctx.request.body;
    
    try {
      const newBalance = await addUSDT(userId, amount, {
        type: 'admin_recharge',
        direction: 'in',
        amount: amount,
        description: `Admin recharge ${amount} USDT`,
      });
      
      console.log(`[WALLET] Admin recharge: user ${userId} +${amount} USDT`);
      
      return { success: true, newBalance };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
