const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

// 测试数据
let inviterUser = null;
let inviteeUser = null;
let inviterToken = null;
let inviteeToken = null;

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 工具函数
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('---');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试步骤
async function testCorrectReferralFormula() {
  try {
    log('🚀 开始测试正确的推荐奖励计算公式');

    // 1. 注册邀请人
    log('1. 注册邀请人');
    const inviterResponse = await api.post('/auth/local/register', {
      username: 'inviter_correct',
      email: 'inviter_correct@test.com',
      password: '123456',
      referralCode: 'TESTCORRECT001'
    });
    inviterUser = inviterResponse.data.user;
    inviterToken = inviterResponse.data.jwt;
    log('邀请人注册成功', { id: inviterUser.id, username: inviterUser.username });

    // 2. 注册被邀请人（使用邀请人的推荐码）
    log('2. 注册被邀请人');
    const inviteeResponse = await api.post('/auth/local/register', {
      username: 'invitee_correct',
      email: 'invitee_correct@test.com',
      password: '123456',
      referralCode: inviterUser.referralCode
    });
    inviteeUser = inviteeResponse.data.user;
    inviteeToken = inviteeResponse.data.jwt;
    log('被邀请人注册成功', { id: inviteeUser.id, username: inviteeUser.username, invitedBy: inviteeUser.invitedBy });

    // 3. 给邀请人充值
    log('3. 给邀请人充值');
    await api.put(`/wallets/${inviterUser.wallet.id}`, {
      data: {
        usdtBalance: 10000,
        aiTokenBalance: 1000
      }
    }, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    log('邀请人充值成功');

    // 4. 给被邀请人充值
    log('4. 给被邀请人充值');
    await api.put(`/wallets/${inviteeUser.wallet.id}`, {
      data: {
        usdtBalance: 10000,
        aiTokenBalance: 1000
      }
    }, {
      headers: { Authorization: `Bearer ${inviteeToken}` }
    });
    log('被邀请人充值成功');

    // 5. 测试场景1：邀请人投资500U，被邀请人投资5000U（锁档）
    log('5. 测试场景1：邀请人投资500U，被邀请人投资5000U（锁档）');
    await testScenario1();

    // 6. 测试场景2：邀请人投资1000U，被邀请人投资2000U（锁档）
    log('6. 测试场景2：邀请人投资1000U，被邀请人投资2000U（锁档）');
    await testScenario2();

    // 7. 测试场景3：邀请人投资5000U，被邀请人投资500U
    log('7. 测试场景3：邀请人投资5000U，被邀请人投资500U');
    await testScenario3();

    // 8. 测试场景4：邀请人投资5000U，被邀请人投资5000U
    log('8. 测试场景4：邀请人投资5000U，被邀请人投资5000U');
    await testScenario4();

    log('✅ 所有测试场景完成');

  } catch (error) {
    log('❌ 测试失败', error.response?.data || error.message);
  } finally {
    // 清理测试数据
    await cleanup();
  }
}

async function testScenario1() {
  // 邀请人投资500U
  const inviterOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN500',
      principalUSDT: 500
    }
  }, {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  // 被邀请人投资5000U
  const inviteeOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN5K',
      principalUSDT: 5000
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景1结果', {
    description: '邀请人投资500U，被邀请人投资5000U（PLAN5K）',
    expected: '35 USDT (500 × 10% × 70% = 35)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[0].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '被邀请人静态收益': '5000 × 10% = 500 USDT',
      '邀请人可计入本金': 'min(5000, 500) = 500 USDT',
      '可继承的静态收益': '500 × (500/5000) = 50 USDT',
      '推荐奖励': '50 × 70% = 35 USDT'
    }
  });
}

async function testScenario2() {
  // 邀请人投资1000U
  const inviterOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN1K',
      principalUSDT: 1000
    }
  }, {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  // 被邀请人投资2000U
  const inviteeOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN2K',
      principalUSDT: 2000
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景2结果', {
    description: '邀请人投资1000U，被邀请人投资2000U（PLAN2K）',
    expected: '64 USDT (1000 × 8% × 80% = 64)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '被邀请人静态收益': '2000 × 8% = 160 USDT',
      '邀请人可计入本金': 'min(2000, 1000) = 1000 USDT',
      '可继承的静态收益': '160 × (1000/2000) = 80 USDT',
      '推荐奖励': '80 × 80% = 64 USDT'
    }
  });
}

async function testScenario3() {
  // 邀请人投资5000U
  const inviterOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN5K',
      principalUSDT: 5000
    }
  }, {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  // 被邀请人投资500U
  const inviteeOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN500',
      principalUSDT: 500
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景3结果', {
    description: '邀请人投资5000U，被邀请人投资500U（PLAN500）',
    expected: '30 USDT (500 × 6% × 100% = 30)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '被邀请人静态收益': '500 × 6% = 30 USDT',
      '邀请人可计入本金': 'min(500, 5000) = 500 USDT',
      '可继承的静态收益': '30 × (500/500) = 30 USDT',
      '推荐奖励': '30 × 100% = 30 USDT'
    }
  });
}

async function testScenario4() {
  // 被邀请人投资5000U
  const inviteeOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN5K',
      principalUSDT: 5000
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景4结果', {
    description: '邀请人投资5000U，被邀请人投资5000U（PLAN5K）',
    expected: '350 USDT (5000 × 10% × 70% = 350)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '被邀请人静态收益': '5000 × 10% = 500 USDT',
      '邀请人可计入本金': 'min(5000, 5000) = 5000 USDT',
      '可继承的静态收益': '500 × (5000/5000) = 500 USDT',
      '推荐奖励': '500 × 70% = 350 USDT'
    }
  });
}

async function cleanup() {
  try {
    log('🧹 清理测试数据');
    
    if (inviterUser) {
      await api.delete(`/users/${inviterUser.id}`, {
        headers: { Authorization: `Bearer ${inviterToken}` }
      });
    }
    
    if (inviteeUser) {
      await api.delete(`/users/${inviteeUser.id}`, {
        headers: { Authorization: `Bearer ${inviteeToken}` }
      });
    }
    
    log('✅ 测试数据清理完成');
  } catch (error) {
    log('⚠️ 清理测试数据时出错', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testCorrectReferralFormula();
}

module.exports = { testCorrectReferralFormula }; 