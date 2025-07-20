import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::referral-reward.referral-reward', ({ strapi }) => ({
  // 获取我的推荐奖励
  async my(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const rewards = await strapi.query('api::referral-reward.referral-reward').findMany({
        where: { referrer: userId },
        populate: ['fromUser', 'fromOrder'],
        orderBy: { createdAt: 'desc' },
      });
      return { data: rewards };
    } catch (error) {
      return ctx.internalServerError('获取推荐奖励失败');
    }
  },
})); 