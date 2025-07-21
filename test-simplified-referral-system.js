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
async function testSimplifiedReferralSystem() {
  try {
    log('🚀 开始测试简化推荐奖励系统（档位资格校验）');

    // 1. 注册邀请人
    log('1. 注册邀请人');
    const inviterResponse = await api.post('/auth/local/register', {
      username: 'inviter_simple',
      email: 'inviter_simple@test.com',
      password: '123456',
      referralCode: 'TESTSIMPLE001'
    });
    inviterUser = inviterResponse.data.user;
    inviterToken = inviterResponse.data.jwt;
    log('邀请人注册成功', { id: inviterUser.id, username: inviterUser.username });

    // 2. 注册被邀请人（使用邀请人的推荐码）
    log('2. 注册被邀请人');
    const inviteeResponse = await api.post('/auth/local/register', {
      username: 'invitee_simple',
      email: 'invitee_simple@test.com',
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

    // 5. 测试场景1：A投500，B投500：A拿30U
    log('5. 测试场景1：A投500，B投500：A拿30U');
    await testScenario1();

    // 6. 测试场景2：A投500，B投1000：A拿63U
    log('6. 测试场景2：A投500，B投1000：A拿63U');
    await testScenario2();

    // 7. 测试场景3：A投500，B投≥2000：A拿0
    log('7. 测试场景3：A投500，B投≥2000：A拿0');
    await testScenario3();

    // 8. 测试场景4：A投5000，B投任意：A按各档比例拿奖励
    log('8. 测试场景4：A投5000，B投任意：A按各档比例拿奖励');
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

  log('场景1结果', {
    description: 'A投500，B投500：A拿30U',
    expected: '30 USDT (500 × 6% × 100% = 30)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[0].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '档位资格校验': 'PLAN500(1) ≥ PLAN500(1) ✓ 有资格',
      '被邀请人静态收益': '500 × 6% = 30 USDT',
      '推荐奖励': '30 × 100% = 30 USDT'
    }
  });
}

async function testScenario2() {
  // 邀请人投资500U（已有）
  // 被邀请人投资1000U
  const inviteeOrder = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN1K',
      principalUSDT: 1000
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
    description: 'A投500，B投1000：A拿63U',
    expected: '0 USDT (PLAN500(1) < PLAN1K(2) 无资格)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '档位资格校验': 'PLAN500(1) < PLAN1K(2) ✗ 无资格',
      '推荐奖励': '0 USDT'
    }
  });
}

async function testScenario3() {
  // 邀请人投资500U（已有）
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
    description: 'A投500，B投≥2000：A拿0',
    expected: '0 USDT (PLAN500(1) < PLAN2K(3) 无资格)',
    actual: referralRewards.data.length > 0 ? `${referralRewards.data[referralRewards.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '档位资格校验': 'PLAN500(1) < PLAN2K(3) ✗ 无资格',
      '推荐奖励': '0 USDT'
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

  log('场景4-1结果', {
    description: 'A投5000，B投500：A按各档比例拿奖励',
    expected: '30 USDT (500 × 6% × 100% = 30)',
    actual: referralRewards1.data.length > 0 ? `${referralRewards1.data[referralRewards1.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '档位资格校验': 'PLAN5K(4) ≥ PLAN500(1) ✓ 有资格',
      '被邀请人静态收益': '500 × 6% = 30 USDT',
      '推荐奖励': '30 × 100% = 30 USDT'
    }
  });

  // 被邀请人投资5000U
  const inviteeOrder2 = await api.post('/subscription-orders', {
    data: {
      plan: 'PLAN5K',
      principalUSDT: 5000
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

  log('场景4-2结果', {
    description: 'A投5000，B投5000：A按各档比例拿奖励',
    expected: '350 USDT (5000 × 10% × 70% = 350)',
    actual: referralRewards2.data.length > 0 ? `${referralRewards2.data[referralRewards2.data.length - 1].amountUSDT} USDT` : '0 USDT',
    calculation: {
      '档位资格校验': 'PLAN5K(4) ≥ PLAN5K(4) ✓ 有资格',
      '被邀请人静态收益': '5000 × 10% = 500 USDT',
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
  testSimplifiedReferralSystem();
}

module.exports = { testSimplifiedReferralSystem }; 