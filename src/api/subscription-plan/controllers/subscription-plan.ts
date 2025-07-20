import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subscription-plan.subscription-plan', ({ strapi }) => ({
  // 获取所有认购计划（公开接口）
  async find(ctx) {
    try {
      const plans = await strapi.query('api::subscription-plan.subscription-plan').findMany({
        orderBy: { principal: 'asc' },
      });
      return { data: plans };
    } catch (error) {
      return ctx.internalServerError('获取认购计划失败');
    }
  },
})); 