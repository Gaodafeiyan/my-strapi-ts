/**
 * lottery-spin controller
 */

import { spinLottery } from '../services/lottery-spin';

export default {
  async spin(ctx) {
    const userId = ctx.state.user.id;

    try {
      const result = await spinLottery(userId);
      return result;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async findMy(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const spins = await strapi.entityService.findMany('api::lottery-spin.lottery-spin', {
        filters: { user: userId } as any,
        populate: ['prize'],
        sort: { createdAt: 'desc' },
      });
      return spins;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}; 