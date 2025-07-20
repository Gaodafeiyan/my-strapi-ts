import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wallet-balance.wallet-balance', ({ strapi }) => ({
  // 获取我的钱包余额
  async my(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const wallet = await strapi.service('api::wallet-balance.wallet-balance').getMyBalance(userId);
      return { data: wallet };
    } catch (error) {
      return ctx.internalServerError('获取钱包余额失败');
    }
  },

  // 获取充值地址
  async depositAddress(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const address = await strapi.service('api::wallet-balance.wallet-balance').getDepositAddress(userId);
      return { data: address };
    } catch (error) {
      return ctx.internalServerError('获取充值地址失败');
    }
  },
})); 