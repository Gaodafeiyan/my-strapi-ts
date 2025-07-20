import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 9);

export default {
  async beforeCreate(event) {
    event.params.data.diamondId    = nanoid();
    event.params.data.referralCode = nanoid();
  },
  async afterCreate(event) {
    const userId = event.result.id;
    
    // 创建钱包余额
    await strapi.entityService.create('api::wallet-balance.wallet-balance', {
      data: { user: userId, usdtBalance: 0, aiTokenBalance: 0 },
    });
    
    // 设置用户角色为authenticated
    try {
      const authenticatedRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
        filters: { name: 'authenticated' }
      });
      
      if (authenticatedRole && authenticatedRole.length > 0) {
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: { role: authenticatedRole[0].id }
        });
        console.log(`✅ 用户 ${userId} 角色设置为 authenticated`);
      }
    } catch (error) {
      console.log('⚠️ 设置用户角色失败:', error.message);
    }
  },
}; 