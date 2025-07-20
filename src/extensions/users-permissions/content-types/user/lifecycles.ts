import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 9);

export default {
  async beforeCreate(event) {
    event.params.data.diamondId    = nanoid();
    event.params.data.referralCode = nanoid();
  },
  async afterCreate(event) {
    const userId = event.result.id;
    
    try {
      // 创建钱包余额
      await strapi.entityService.create('api::wallet-balance.wallet-balance', {
        data: { user: userId, usdtBalance: 0, aiTokenBalance: 0 },
      });
      console.log(`✅ 用户 ${userId} 钱包创建成功`);
      
      // 设置用户角色为authenticated
      const authenticatedRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
        filters: { name: 'authenticated' }
      });
      
      if (authenticatedRole && authenticatedRole.length > 0) {
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: { role: authenticatedRole[0].id }
        });
        console.log(`✅ 用户 ${userId} 角色设置为 authenticated (ID: ${authenticatedRole[0].id})`);
      } else {
        console.log('⚠️ 未找到 authenticated 角色');
      }
    } catch (error) {
      console.log('❌ 用户创建后处理失败:', error.message);
    }
  },
}; 