import cron from 'node-cron';

export default ({ strapi }) => {
  // 每5分钟检查过期订单并赎回
  cron.schedule('*/5 * * * *', async () => {
    try {
      const redeemedCount = await strapi.service('api::subscription-order.subscription-order').redeemExpiredOrders();
      if (redeemedCount > 0) {
        strapi.log.info(`自动赎回了 ${redeemedCount} 个过期订单`);
      }
    } catch (error) {
      strapi.log.error('自动赎回订单失败:', error);
    }
  });

  // 每小时处理待处理的提现
  cron.schedule('0 * * * *', async () => {
    try {
      const pendingWithdraws = await strapi.query('api::usdt-withdraw.usdt-withdraw').findMany({
        where: { status: 'pending' },
        populate: ['user'],
      });

      for (const withdraw of pendingWithdraws) {
        try {
          // 这里应该调用实际的区块链转账
          // 目前只是模拟成功
          const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
          
          await strapi.query('api::usdt-withdraw.usdt-withdraw').update({
            where: { id: withdraw.id },
            data: {
              status: 'success',
              txHash,
            },
          });

          strapi.log.info(`提现成功: ${withdraw.id}, txHash: ${txHash}`);
        } catch (error) {
          // 提现失败，退款给用户
          await strapi.service('api::wallet-balance.wallet-balance').add(withdraw.user.id, withdraw.amount, {
            txType: 'withdraw',
            direction: 'in',
            amount: withdraw.amount,
          });

          await strapi.query('api::usdt-withdraw.usdt-withdraw').update({
            where: { id: withdraw.id },
            data: {
              status: 'failed',
            },
          });

          strapi.log.error(`提现失败，已退款: ${withdraw.id}`, error);
        }
      }
    } catch (error) {
      strapi.log.error('处理提现失败:', error);
    }
  });

  strapi.log.info('定时任务已启动');
}; 