import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::usdt-withdraw.usdt-withdraw', ({ strapi }) => ({
  // 创建提现申请
  async create(ctx) {
    const userId = ctx.state.user.id;
    const { amount, toAddress } = ctx.request.body;

    if (!amount || !toAddress) {
      return ctx.badRequest('缺少必填字段');
    }

    if (amount <= 0) {
      return ctx.badRequest('提现金额必须大于0');
    }

    try {
      // 检查用户余额
      const wallet = await strapi.service('api::wallet-balance.wallet-balance').getMyBalance(userId);
      if (wallet.usdt < amount) {
        return ctx.badRequest('余额不足');
      }

      // 冻结余额
      await strapi.service('api::wallet-balance.wallet-balance').add(userId, -amount, {
        txType: 'withdraw',
        direction: 'out',
        amount,
      });

      // 创建提现记录
      const withdraw = await strapi.query('api::usdt-withdraw.usdt-withdraw').create({
        data: {
          amount,
          toAddress,
          status: 'pending',
          user: userId,
        },
      });

      return { data: withdraw };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 获取我的提现记录
  async my(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const withdraws = await strapi.query('api::usdt-withdraw.usdt-withdraw').findMany({
        where: { user: userId },
        orderBy: { createdAt: 'desc' },
      });
      return { data: withdraws };
    } catch (error) {
      return ctx.internalServerError('获取提现记录失败');
    }
  },
})); 