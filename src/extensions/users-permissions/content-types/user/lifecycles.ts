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
      console.log(`[USER] Wallet created for user ${userId}`);
    } catch (error) {
      console.error('[USER] Failed to create wallet after user creation:', error.message);
    }
  },
}; 