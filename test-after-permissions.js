const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testAfterPermissions() {
  console.log('🧪 测试权限修复后的功能...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 创建测试用户
    const username = 'testuser_' + Math.random().toString(36).substring(2, 8);
    console.log('1. 创建测试用户...');
    
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

    // 2. 测试钱包余额访问
    console.log('\n2. 测试钱包余额访问...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 钱包余额访问成功:', {
        usdtBalance: balanceResponse.data.usdtBalance,
        aiTokenBalance: balanceResponse.data.aiTokenBalance
      });
    } catch (error) {
      console.log('❌ 钱包余额访问失败:', error.response?.status, error.response?.data);
    }

    // 3. 测试充值功能
    console.log('\n3. 测试充值功能...');
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
    console.log('\n5. 测试购买订单...');
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

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行测试
testAfterPermissions(); 