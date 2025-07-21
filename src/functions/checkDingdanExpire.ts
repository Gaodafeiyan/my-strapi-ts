export default {
  async checkDingdanExpire() {
    try {
      console.log('🔍 开始检查过期订单...');
      
      // 查找所有已过期但未完成的订单
      const expiredOrders = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').findMany({
        where: {
          zhuangtai: 'active',
          jieshuShiJian: {
            $lt: new Date()
          }
        },
        populate: {
          yonghu: {
            populate: ['shangji']
          },
          jihua: true
        }
      });
      
      console.log(`📊 找到 ${expiredOrders.length} 个过期订单`);
      
      // 批量处理过期订单
      for (const order of expiredOrders) {
        try {
          await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(order.id);
          console.log(`✅ 订单 ${order.id} 赎回成功`);
        } catch (error) {
          console.error(`❌ 订单 ${order.id} 赎回失败:`, error.message);
        }
      }
      
      console.log('🎉 过期订单检查完成');
    } catch (error) {
      console.error('❌ 检查过期订单时出错:', error);
    }
  }
}; 