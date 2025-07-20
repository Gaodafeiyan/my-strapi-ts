import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subscription-order.subscription-order', ({ strapi }) => ({
  // 创建认购订单
  async create(ctx) {
    const userId = ctx.state.user.id;
    const { planId } = ctx.request.body;

    if (!planId) {
      return ctx.badRequest('缺少计划ID');
    }

    try {
      const order = await strapi.service('api::subscription-order.subscription-order').createOrder(userId, planId);
      return { data: order };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 获取我的订单
  async my(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const orders = await strapi.query('api::subscription-order.subscription-order').findMany({
        where: { user: userId },
        populate: ['plan'],
        orderBy: { createdAt: 'desc' },
      });
      return { data: orders };
    } catch (error) {
      return ctx.internalServerError('获取订单失败');
    }
  },
})); 