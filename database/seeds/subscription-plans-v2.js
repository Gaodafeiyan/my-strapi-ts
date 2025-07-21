/**
 * 认购计划 V2 种子数据
 * 按照新业务规格更新
 */

module.exports = {
  async up(knex) {
    // 清空现有数据
    await knex('subscription_plans').del();
    
    // 插入新的认购计划数据
    const plans = [
      {
        planCode: 'PLAN500',
        principalUSDT: 500,
        cycle_days: 15,
        staticPct: 6.0,
        tokenBonusPct: 3.0,
        enabled: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        planCode: 'PLAN1K',
        principalUSDT: 1000,
        cycle_days: 20,
        staticPct: 7.0,
        tokenBonusPct: 4.0,
        enabled: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        planCode: 'PLAN2K',
        principalUSDT: 2000,
        cycle_days: 25,
        staticPct: 8.0,
        tokenBonusPct: 5.0,
        enabled: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        planCode: 'PLAN5K',
        principalUSDT: 5000,
        cycle_days: 30,
        staticPct: 10.0,
        tokenBonusPct: 6.0,
        enabled: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await knex('subscription_plans').insert(plans);
    console.log('✅ 认购计划 V2 数据已更新');
  },

  async down(knex) {
    await knex('subscription_plans').del();
  }
}; 