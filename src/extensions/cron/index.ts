import { processRedeem } from '../../api/subscription-order/services/subscription-order';

export default {
  '*/10 * * * *': async () => {
    try {
      // 查询到期的活跃订单
      const dueOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
        filters: {
          state: 'active',
          endAt: {
            $lte: new Date(),
          },
        } as any,
        populate: ['plan', 'user'],
      });

      console.log(`Found ${dueOrders.length} due orders`);

      // 处理每个到期订单
      for (const order of dueOrders) {
        try {
          await processRedeem(order);
          console.log(`Processed order ${order.id}`);
        } catch (error) {
          console.error(`Failed to process order ${order.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  },
}; 