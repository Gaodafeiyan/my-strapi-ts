const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 生成随机用户名
function generateRandomUsername() {
  return 'simpleuser_' + Math.random().toString(36).substring(2, 8);
}

async function testSimpleAuth() {
  console.log('🔍 简单认证测试...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 注册用户
    const username = generateRandomUsername();
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
      role: user.role?.name || 'undefined'
    });

    // 2. 测试公开接口
    console.log('\n2. 测试公开接口...');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/api/subscription-plans`);
      console.log('✅ 公开接口访问成功');
    } catch (error) {
      console.log('❌ 公开接口访问失败:', error.response?.status);
    }

    // 3. 测试需要认证的接口
    console.log('\n3. 测试需要认证的接口...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 用户信息接口成功:', {
        id: meResponse.data.id,
        username: meResponse.data.username,
        role: meResponse.data.role?.name || 'undefined'
      });
    } catch (error) {
      console.log('❌ 用户信息接口失败:', error.response?.status, error.response?.data);
    }

    // 4. 测试钱包接口
    console.log('\n4. 测试钱包接口...');
    try {
      const walletResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 钱包接口成功:', {
        usdtBalance: walletResponse.data.usdtBalance,
        aiTokenBalance: walletResponse.data.aiTokenBalance
      });
    } catch (error) {
      console.log('❌ 钱包接口失败:', error.response?.status, error.response?.data);
    }

    // 5. 测试充值地址接口
    console.log('\n5. 测试充值地址接口...');
    try {
      const addrResponse = await axios.get(`${BASE_URL}/api/wallet-balances/deposit-address`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 充值地址接口成功:', addrResponse.data);
    } catch (error) {
      console.log('❌ 充值地址接口失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行测试
testSimpleAuth(); 