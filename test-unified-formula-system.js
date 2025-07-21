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
async function testUnifiedFormulaSystem() {
  try {
    log('🚀 开始测试统一公式推荐奖励系统');

    // 1. 注册邀请人
    log('1. 注册邀请人');
    const inviterResponse = await api.post('/auth/local/register', {
      username: 'inviter_unified',
      email: 'inviter_unified@test.com',
      password: '123456',
      referralCode: 'TESTUNIFIED001'
    });
    inviterUser = inviterResponse.data.user;
    inviterToken = inviterResponse.data.jwt;
    log('邀请人注册成功', { id: inviterUser.id, username: inviterUser.username });

    // 2. 注册被邀请人（使用邀请人的推荐码）
    log('2. 注册被邀请人');
    const inviteeResponse = await api.post('/auth/local/register', {
      username: 'invitee_unified',
      email: 'invitee_unified@test.com',
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

    // 5. 测试场景1：邀请人投资500U
    log('5. 测试场景1：邀请人投资500U');
    await testScenario1();

    // 6. 测试场景2：邀请人投资1000U
    log('6. 测试场景2：邀请人投资1000U');
    await testScenario2();

    // 7. 测试场景3：邀请人投资2000U
    log('7. 测试场景3：邀请人投资2000U');
    await testScenario3();

    // 8. 测试场景4：邀请人投资5000U
    log('8. 测试场景4：邀请人投资5000U');
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

  // 被邀请人投资500U
  const inviteeOrder1 = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN500',
      principalUSDT: 500
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder1.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards1 = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景1-1结果', {
    description: '邀请人投资500U，被邀请人投资500U',
    expected: '30 USDT (min(500,500) × 6% × 100% = 30)',
    actual: referralRewards1.data.length > 0 ? `${referralRewards1.data[0].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN500',
      '邀请人静态收益率': '6%',
      '邀请人返佣比例': '100%',
      '本金上限': 'min(500, 500) = 500',
      '推荐奖励': '500 × 6% × 100% = 30 USDT'
    }
  });

  // 被邀请人投资1000U
  const inviteeOrder2 = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN1K',
      principalUSDT: 1000
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder2.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards2 = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景1-2结果', {
    description: '邀请人投资500U，被邀请人投资1000U',
    expected: '30 USDT (min(1000,500) × 6% × 100% = 30)',
    actual: referralRewards2.data.length > 0 ? `${referralRewards2.data[referralRewards2.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN500',
      '邀请人静态收益率': '6%',
      '邀请人返佣比例': '100%',
      '本金上限': 'min(1000, 500) = 500',
      '推荐奖励': '500 × 6% × 100% = 30 USDT'
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

  // 被邀请人投资500U
  const inviteeOrder1 = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN500',
      principalUSDT: 500
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder1.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards1 = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景2-1结果', {
    description: '邀请人投资1000U，被邀请人投资500U',
    expected: '32 USDT (min(500,1000) × 7% × 90% = 32)',
    actual: referralRewards1.data.length > 0 ? `${referralRewards1.data[referralRewards1.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN1K',
      '邀请人静态收益率': '7%',
      '邀请人返佣比例': '90%',
      '本金上限': 'min(500, 1000) = 500',
      '推荐奖励': '500 × 7% × 90% = 31.5 ≈ 32 USDT'
    }
  });

  // 被邀请人投资1000U
  const inviteeOrder2 = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN1K',
      principalUSDT: 1000
    }
  }, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 赎回被邀请人订单
  await api.post(`/subscription-orders/${inviteeOrder2.data.id}/redeem`, {}, {
    headers: { Authorization: `Bearer ${inviteeToken}` }
  });

  // 检查推荐奖励
  const referralRewards2 = await api.get('/referral-rewards', {
    headers: { Authorization: `Bearer ${inviterToken}` }
  });

  log('场景2-2结果', {
    description: '邀请人投资1000U，被邀请人投资1000U',
    expected: '63 USDT (min(1000,1000) × 7% × 90% = 63)',
    actual: referralRewards2.data.length > 0 ? `${referralRewards2.data[referralRewards2.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN1K',
      '邀请人静态收益率': '7%',
      '邀请人返佣比例': '90%',
      '本金上限': 'min(1000, 1000) = 1000',
      '推荐奖励': '1000 × 7% × 90% = 63 USDT'
    }
  });
}

async function testScenario3() {
  // 邀请人投资2000U
  const inviterOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN2K',
      principalUSDT: 2000
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

  log('场景3结果', {
    description: '邀请人投资2000U，被邀请人投资2000U',
    expected: '128 USDT (min(2000,2000) × 8% × 80% = 128)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN2K',
      '邀请人静态收益率': '8%',
      '邀请人返佣比例': '80%',
      '本金上限': 'min(2000, 2000) = 2000',
      '推荐奖励': '2000 × 8% × 80% = 128 USDT'
    }
  });
}

async function testScenario4() {
  // 邀请人投资5000U
  const inviterOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN5K',
      principalUSDT: 5000
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

  log('场景4结果', {
    description: '邀请人投资5000U，被邀请人投资5000U',
    expected: '350 USDT (min(5000,5000) × 10% × 70% = 350)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '邀请人档位': 'PLAN5K',
      '邀请人静态收益率': '10%',
      '邀请人返佣比例': '70%',
      '本金上限': 'min(5000, 5000) = 5000',
      '推荐奖励': '5000 × 10% × 70% = 350 USDT'
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
  testUnifiedFormulaSystem();
}

module.exports = { testUnifiedFormulaSystem }; 