/**
 * subscription-order controller
 */

import { createOrder, findMyOrders, redeemOrder } from '../services/subscription-order';

export default {
  async create(ctx) {
    console.log('🔍 subscription-order.create - 用户信息:', ctx.state.user);
    console.log('🔍 请求体:', ctx.request.body);
    
    const { planCode } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      const order = await createOrder(userId, planCode);
      return order;
    } catch (error) {
      console.log('❌ 创建订单失败:', error.message);
      return ctx.badRequest(error.message);
    }
  },

  async findMy(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const orders = await findMyOrders(userId);
      return orders;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async redeemManual(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;

    try {
      await redeemOrder(parseInt(id), userId);
      return { success: true };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
