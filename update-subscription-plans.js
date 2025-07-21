/**
 * 更新认购计划 V2 脚本
 * 运行此脚本更新认购计划数据
 */

const knex = require('knex');
const path = require('path');

// 数据库配置
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '.tmp/data.db')
  },
  useNullAsDefault: true
};

async function updateSubscriptionPlans() {
  const db = knex(dbConfig);
  
  try {
    console.log('🔄 开始更新认购计划 V2...');
    
    // 清空现有数据
    await db('subscription_plans').del();
    console.log('✅ 已清空现有认购计划数据');
    
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

    await db('subscription_plans').insert(plans);
    console.log('✅ 认购计划 V2 数据已更新');
    
    // 显示更新后的数据
    const updatedPlans = await db('subscription_plans').select('*');
    console.log('\n📊 更新后的认购计划:');
    updatedPlans.forEach(plan => {
      console.log(`  ${plan.planCode}: ${plan.principalUSDT}U, ${plan.staticPct}%, ${plan.cycle_days}天, ${plan.tokenBonusPct}% AI Token`);
    });
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await db.destroy();
  }
}

// 运行更新
if (require.main === module) {
  updateSubscriptionPlans();
}

module.exports = { updateSubscriptionPlans }; 