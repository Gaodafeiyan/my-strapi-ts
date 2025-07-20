const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试数据
const testData = {
  inviteRegister: {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    inviteCode: null // 可选
  },
  subscriptionOrder: {
    planCode: 'PLAN500'
  },
  withdraw: {
    amount: 100,
    address: 'TRC20_ADDRESS_HERE',
    network: 'TRC20'
  }
};

async function testAPI() {
  console.log('🚀 开始测试投资平台API...\n');

  try {
    // 1. 测试邀请注册
    console.log('1. 测试邀请注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, testData.inviteRegister);
    console.log('✅ 注册成功:', registerResponse.data.user);
    
    const { jwt, user } = registerResponse.data;
    const headers = { Authorization: `Bearer ${jwt}` };

    // 2. 测试钱包余额查询
    console.log('\n2. 测试钱包余额查询...');
    const walletResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, { headers });
    console.log('✅ 钱包余额:', walletResponse.data);

    // 3. 测试充值地址查询
    console.log('\n3. 测试充值地址查询...');
    const addressResponse = await axios.get(`${BASE_URL}/api/wallet-balances/deposit-address`, { headers });
    console.log('✅ 充值地址:', addressResponse.data);

    // 4. 测试订阅订单查询
    console.log('\n4. 测试订阅订单查询...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/subscription-orders/my`, { headers });
    console.log('✅ 我的订单:', ordersResponse.data);

    // 5. 测试推荐奖励查询
    console.log('\n5. 测试推荐奖励查询...');
    const rewardsResponse = await axios.get(`${BASE_URL}/api/referral-rewards/my`, { headers });
    console.log('✅ 推荐奖励:', rewardsResponse.data);

    // 6. 测试提现记录查询
    console.log('\n6. 测试提现记录查询...');
    const withdrawsResponse = await axios.get(`${BASE_URL}/api/usdt-withdraws/my`, { headers });
    console.log('✅ 提现记录:', withdrawsResponse.data);

    console.log('\n🎉 所有API测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testAPI(); 