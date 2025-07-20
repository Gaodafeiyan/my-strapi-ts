import { nanoid } from 'nanoid';

export default {
  beforeCreate: async (event: any) => {
    const { data } = event.params;
    
    // 生成唯一的 diamondId (10位字母数字)
    let diamondId: string;
    do {
      diamondId = nanoid(10);
    } while (await (strapi as any).query('plugin::users-permissions.user').findOne({
      where: { diamondId }
    }));
    
    // 生成唯一的 referralCode (8位字母数字)
    let referralCode: string;
    do {
      referralCode = nanoid(8);
    } while (await (strapi as any).query('plugin::users-permissions.user').findOne({
      where: { referralCode }
    }));
    
    data.diamondId = diamondId;
    data.referralCode = referralCode;
  },
}; 