export default {
  beforeCreate: async (event) => {
    const { data } = event.params;
    
    // 生成钻石ID (9位数字)
    data.diamondId = Math.floor(100000000 + Math.random() * 900000000).toString();
    
    // 生成推荐码 (9位字母数字组合)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    for (let i = 0; i < 9; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    data.referralCode = referralCode;
    
    // 初始化淘金次数
    data.goldRushCount = 0;
    
    // 初始化解锁档位 (默认只有500 USDT档位)
    data.unlockedPlans = ['500'];
    
    // 初始化购买次数统计
    data.planPurchaseCounts = {
      '500': 0,
      '1000': 0,
      '2000': 0,
      '5000': 0,
    };
  },

  afterCreate: async (event) => {
    const { result } = event;
    
    // 创建用户钱包余额记录
    await (strapi as any).entityService.create('api::wallet-balance.wallet-balance', {
      data: {
        user: result.id,
        balanceUSDT: 0,
        aiTokenBalanceUSDT: 0,
        totalEarningsUSDT: 0,
        todayEarningsUSDT: 0,
        totalInviteEarningsUSDT: 0,
        totalStaticEarningsUSDT: 0,
        activeOrdersCount: 0,
        lastUpdated: new Date(),
      },
    });
  },
}; 