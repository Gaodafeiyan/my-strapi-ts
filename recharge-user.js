const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function rechargeUser() {
  console.log('💰 给用户充值10000万余额...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 注册用户
    const username = 'richuser_' + Math.random().toString(36).substring(2, 8);
    console.log('1. 注册新用户...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    const { jwt, user } = registerResponse.data;
    console.log('✅ 用户注册成功:', {
      id: user.id,
      username: user.username,
      role: user.role
    });

    // 2. 检查初始余额
    console.log('\n2. 检查初始余额...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 初始余额:', {
        usdtBalance: balanceResponse.data.usdtBalance,
        aiTokenBalance: balanceResponse.data.aiTokenBalance
      });
    } catch (error) {
      console.log('❌ 获取余额失败:', error.response?.status, error.response?.data);
    }

    // 3. 充值10000万USDT
    console.log('\n3. 充值10000万USDT...');
    try {
      const rechargeResponse = await axios.post(`${BASE_URL}/api/wallet-balances/admin-recharge`, {
        userId: user.id,
        amount: 100000000 // 10000万
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 充值成功:', rechargeResponse.data);
    } catch (error) {
      console.log('❌ 充值失败:', error.response?.status, error.response?.data);
    }

    // 4. 检查充值后余额
    console.log('\n4. 检查充值后余额...');
    try {
      const newBalanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 充值后余额:', {
        usdtBalance: newBalanceResponse.data.usdtBalance,
        aiTokenBalance: newBalanceResponse.data.aiTokenBalance
      });
    } catch (error) {
      console.log('❌ 获取余额失败:', error.response?.status, error.response?.data);
    }

    // 5. 测试购买订单
    console.log('\n5. 测试购买PLAN500...');
    try {
      const orderResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
        planCode: 'PLAN500'
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 购买订单成功:', {
        id: orderResponse.data.id,
        state: orderResponse.data.state,
        principalUSDT: orderResponse.data.principalUSDT
      });
    } catch (error) {
      console.log('❌ 购买订单失败:', error.response?.status, error.response?.data);
    }

    // 6. 检查购买后余额
    console.log('\n6. 检查购买后余额...');
    try {
      const finalBalanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 购买后余额:', {
        usdtBalance: finalBalanceResponse.data.usdtBalance,
        aiTokenBalance: finalBalanceResponse.data.aiTokenBalance
      });
    } catch (error) {
      console.log('❌ 获取余额失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行充值
rechargeUser(); 