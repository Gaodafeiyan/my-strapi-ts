/**
 * lottery-banner controller
 */

export default {
  async findActive(ctx) {
    try {
      const banners = await strapi.entityService.findMany('api::lottery-banner.lottery-banner', {
        filters: { enabled: true } as any,
        populate: ['image'],
        sort: { sortOrder: 'asc', createdAt: 'desc' },
      });
      return banners;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}; 