import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::qianbao-yue.qianbao-yue', ({ strapi }) => ({
  
  // 获取用户钱包余额
  async myWallet(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      const wallet = await strapi.service('api::qianbao-yue.qianbao-yue').getUserWallet(userId);
      
      ctx.body = {
        success: true,
        data: wallet
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  },
  
  // 充值USDT（管理员功能）
  async recharge(ctx) {
    try {
      const { userId, amount } = ctx.request.body;
      
      // 检查管理员权限
      if (ctx.state.user.role.type !== 'admin') {
        throw new Error('无权限执行此操作');
      }
      
      const result = await strapi.service('api::qianbao-yue.qianbao-yue')
        .add(userId, amount, { txType: 'recharge' });
      
      ctx.body = {
        success: true,
        data: result,
        message: '充值成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  }
})); 