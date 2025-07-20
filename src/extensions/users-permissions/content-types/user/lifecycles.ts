import { nanoid } from 'nanoid';

export default {
  beforeCreate: async (event: any) => {
    const { data } = event.params;
    
    // 生成唯一的 diamondId (9位字母数字)
    let diamondId: string;
    do {
      diamondId = nanoid(9);
    } while (await (strapi as any).query('plugin::users-permissions.user').findOne({
      where: { diamondId }
    }));
    
    // 生成唯一的 referralCode (9位字母数字)
    let referralCode: string;
    do {
      referralCode = nanoid(9);
    } while (await (strapi as any).query('plugin::users-permissions.user').findOne({
      where: { referralCode }
    }));
    
    data.diamondId = diamondId;
    data.referralCode = referralCode;
  },

  afterCreate: async (event: any) => {
    const { result } = event;
    
    // 初始化钱包余额
    await (strapi as any).query('api::wallet-balance.wallet-balance').create({
      data: {
        user: result.id,
        usdtBalance: 0,
        aiTokenBalance: 0,
      },
    });
  },
}; 