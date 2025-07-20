/**
 * referral-reward controller
 */

import { factories } from '@strapi/strapi'

export default {
  async findMine(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const rewards = await strapi.entityService.findMany('api::referral-reward.referral-reward', {
        filters: { referrer: userId } as any,
        populate: ['fromUser'],
        sort: { createdAt: 'desc' },
      });
      return rewards;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
