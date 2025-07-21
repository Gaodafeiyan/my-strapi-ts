import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::dinggou-dingdan.dinggou-dingdan', ({ strapi }) => ({
  
  // 创建认购订单
  async create(ctx) {
    try {
      const { jihuaId } = ctx.request.body;
      const userId = ctx.state.user.id;
      
      const result = await strapi.service('api::dinggou-dingdan.dinggou-dingdan')
        .createWithChecks(userId, jihuaId);
      
      ctx.body = {
        success: true,
        data: result,
        message: '认购订单创建成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  },
  
  // 赎回订单
  async redeem(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;
      
      // 验证订单所有权
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', id);
      if (!order || order.yonghu !== userId) {
        throw new Error('订单不存在或无权限');
      }
      
      const result = await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(id);
      
      ctx.body = {
        success: true,
        data: result,
        message: '订单赎回成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  },
  
  // 获取用户订单列表
  async myOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { yonghu: userId },
        populate: { jihua: true },
        sort: { createdAt: 'desc' }
      });
      
      ctx.body = {
        success: true,
        data: orders
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