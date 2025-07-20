const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
let userA = null;
let userB = null;
let orderId = null;
let withdrawId = null;

// 测试工具函数
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const test = async (name, testFn) => {
  try {
    console.log(`\n📋 测试: ${name}`);
    await testFn();
    console.log(`✅ ${name} - 通过`);
  } catch (error) {
    console.log(`❌ ${name} - 失败: ${error.message}`);
    throw error;
  }
};

// 1. 注册用户A（无邀请码）
const registerUserA = async () => {
  const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
    username: 'testuserA',
    email: 'testA@example.com',
    password: 'password123',
  });
  
  userA = response.data;
  log('用户A注册成功', {
    id: userA.id,
    diamondId: userA.diamondId,
    referralCode: userA.referralCode
  });
  
  return userA;
};

// 2. 注册用户B（使用A的邀请码）
const registerUserB = async () => {
  const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
    username: 'testuserB',
    email: 'testB@example.com',
    password: 'password123',
    inviteCode: userA.referralCode,
  });
  
  userB = response.data;
  log('用户B注册成功', {
    id: userB.id,
    invitedBy: userB.invitedBy?.id
  });
  
  if (userB.invitedBy?.id !== userA.id) {
    throw new Error('邀请关系不正确');
  }
  
  return userB;
};

// 3. 用户A充值500 USDT
const rechargeUserA = async () => {
  // 这里需要手动调用服务或直接操作数据库
  // 暂时跳过，实际测试时需要管理员权限
  log('用户A充值500 USDT（需要管理员操作）');
  return true;
};

// 4. 用户B充值500 USDT
const rechargeUserB = async () => {
  log('用户B充值500 USDT（需要管理员操作）');
  return true;
};

// 5. 用户B购买PLAN500
const purchasePlan = async () => {
  const response = await axios.post(`${BASE_URL}/api/subscription-orders`, {
    planCode: 'PLAN500'
  }, {
    headers: {
      'Authorization': `Bearer ${userB.jwt}`
    }
  });
  
  const order = response.data;
  orderId = order.id;
  
  log('用户B购买PLAN500成功', {
    orderId: order.id,
    state: order.state,
    principalUSDT: order.principalUSDT
  });
  
  if (order.state !== 'active') {
    throw new Error('订单状态不正确');
  }
  
  return order;
};

// 6. 手动触发赎回
const redeemOrder = async () => {
  const response = await axios.post(`${BASE_URL}/api/subscription-orders/${orderId}/redeemManual`, {}, {
    headers: {
      'Authorization': `Bearer ${userB.jwt}`
    }
  });
  
  log('手动赎回成功', response.data);
  
  if (!response.data.success) {
    throw new Error('赎回失败');
  }
  
  return response.data;
};

// 7. 检查赎回后余额
const checkBalances = async () => {
  // 检查用户B余额
  const responseB = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
    headers: {
      'Authorization': `Bearer ${userB.jwt}`
    }
  });
  
  const walletB = responseB.data;
  log('用户B钱包余额', {
    usdtBalance: walletB.usdtBalance,
    aiTokenBalance: walletB.aiTokenBalance
  });
  
  // 检查用户A余额
  const responseA = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
    headers: {
      'Authorization': `Bearer ${userA.jwt}`
    }
  });
  
  const walletA = responseA.data;
  log('用户A钱包余额', {
    usdtBalance: walletA.usdtBalance,
    aiTokenBalance: walletA.aiTokenBalance
  });
  
  // 验证预期结果
  if (walletB.usdtBalance !== 30) {
    throw new Error(`用户B余额不正确: ${walletB.usdtBalance}, 期望: 30`);
  }
  
  if (walletA.usdtBalance !== 530) {
    throw new Error(`用户A余额不正确: ${walletA.usdtBalance}, 期望: 530`);
  }
  
  return { walletA, walletB };
};

// 8. 检查返佣记录
const checkReferralRewards = async () => {
  const response = await axios.get(`${BASE_URL}/api/referral-rewards/my`, {
    headers: {
      'Authorization': `Bearer ${userA.jwt}`
    }
  });
  
  const rewards = response.data;
  log('用户A的返佣记录', {
    count: rewards.length,
    rewards: rewards.map(r => ({
      amountUSDT: r.amountUSDT,
      fromUser: r.fromUser?.username
    }))
  });
  
  if (rewards.length !== 1) {
    throw new Error(`返佣记录数量不正确: ${rewards.length}, 期望: 1`);
  }
  
  if (rewards[0].amountUSDT !== 30) {
    throw new Error(`返佣金额不正确: ${rewards[0].amountUSDT}, 期望: 30`);
  }
  
  return rewards;
};

// 9. 用户B提现
const withdrawUSDT = async () => {
  const response = await axios.post(`${BASE_URL}/api/usdt-withdraws`, {
    amount: 30,
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    network: 'BEP20'
  }, {
    headers: {
      'Authorization': `Bearer ${userB.jwt}`
    }
  });
  
  const withdraw = response.data;
  withdrawId = withdraw.id;
  
  log('用户B提现申请成功', {
    id: withdraw.id,
    amount: withdraw.amount,
    status: withdraw.status,
    address: withdraw.address
  });
  
  if (withdraw.status !== 'pending') {
    throw new Error('提现状态不正确');
  }
  
  return withdraw;
};

// 10. 管理员确认提现
const confirmWithdraw = async () => {
  const response = await axios.put(`${BASE_URL}/api/usdt-withdraws/${withdrawId}/confirm`, {
    txHash: '0x123456789abcdef'
  }, {
    headers: {
      'Authorization': `Bearer ${userA.jwt}` // 这里应该用管理员token
    }
  });
  
  log('提现确认成功', response.data);
  
  if (!response.data.success) {
    throw new Error('提现确认失败');
  }
  
  return response.data;
};

// 主测试流程
const runAllTests = async () => {
  console.log('🚀 开始集成测试...');
  console.log(`📍 测试服务器: ${BASE_URL}`);
  
  try {
    await test('1. 注册用户A（无邀请码）', registerUserA);
    await test('2. 注册用户B（使用A的邀请码）', registerUserB);
    await test('3. 用户A充值500 USDT', rechargeUserA);
    await test('4. 用户B充值500 USDT', rechargeUserB);
    await test('5. 用户B购买PLAN500', purchasePlan);
    await test('6. 手动触发赎回', redeemOrder);
    await test('7. 检查赎回后余额', checkBalances);
    await test('8. 检查返佣记录', checkReferralRewards);
    await test('9. 用户B提现', withdrawUSDT);
    await test('10. 管理员确认提现', confirmWithdraw);
    
    console.log('\n🎉 所有测试通过！');
    console.log('✅ 阶段-2 联调测试完成');
    
  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
};

// 运行测试
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  test,
  log
}; 