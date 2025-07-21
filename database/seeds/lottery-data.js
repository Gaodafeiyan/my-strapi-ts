/**
 * 抽奖系统数据种子
 * 包含抽奖配置、奖品和轮播图数据
 */

module.exports = {
  async up(knex) {
    // 清空现有数据
    await knex('lottery_configs').del();
    await knex('lottery_prizes').del();
    await knex('lottery_banners').del();
    
    // 插入抽奖配置
    const configs = [
      {
        name: '幸运抽奖',
        costUSDT: 10.0,
        maxPrizes: 1000,
        winRate: 30.0, // 30%中奖率
        enabled: true,
        description: '每日幸运抽奖，有机会获得丰厚奖励',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await knex('lottery_configs').insert(configs);
    console.log('✅ 抽奖配置数据已创建');

    // 插入奖品数据
    const prizes = [
      {
        name: '特等奖',
        amountUSDT: 1000.0,
        weight: 1,
        stock: -1,
        enabled: true,
        description: '特等奖：1000 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '一等奖',
        amountUSDT: 500.0,
        weight: 3,
        stock: -1,
        enabled: true,
        description: '一等奖：500 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '二等奖',
        amountUSDT: 200.0,
        weight: 10,
        stock: -1,
        enabled: true,
        description: '二等奖：200 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '三等奖',
        amountUSDT: 100.0,
        weight: 20,
        stock: -1,
        enabled: true,
        description: '三等奖：100 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '四等奖',
        amountUSDT: 50.0,
        weight: 50,
        stock: -1,
        enabled: true,
        description: '四等奖：50 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '五等奖',
        amountUSDT: 20.0,
        weight: 100,
        stock: -1,
        enabled: true,
        description: '五等奖：20 USDT',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '谢谢参与',
        amountUSDT: 0.0,
        weight: 200,
        stock: -1,
        enabled: true,
        description: '谢谢参与，下次再来',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await knex('lottery_prizes').insert(prizes);
    console.log('✅ 奖品数据已创建');

    // 插入轮播图数据（示例）
    const banners = [
      {
        title: '幸运抽奖',
        link: '/lottery',
        sortOrder: 1,
        enabled: true,
        description: '每日幸运抽奖，赢取丰厚奖励',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '大奖等你来',
        link: '/lottery',
        sortOrder: 2,
        enabled: true,
        description: '特等奖1000 USDT等你来拿',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await knex('lottery_banners').insert(banners);
    console.log('✅ 轮播图数据已创建');
  },

  async down(knex) {
    await knex('lottery_configs').del();
    await knex('lottery_prizes').del();
    await knex('lottery_banners').del();
  }
}; 