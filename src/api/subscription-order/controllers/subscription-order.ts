/**
 * subscription-order controller
 */

import { createOrder, findMyOrders, redeemOrder } from '../services/subscription-order';

export default {
  async create(ctx) {
    const { planCode } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      const order = await createOrder(userId, planCode);
      return order;
    } catch (error) {
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
