const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 生成随机用户名
function generateRandomUsername() {
  return 'roleuser_' + Math.random().toString(36).substring(2, 8);
}

async function debugUserRole() {
  console.log('🔍 调试用户角色设置...\n');
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

    // 2. 等待一下让lifecycle执行
    console.log('\n2. 等待lifecycle执行...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 检查用户详情
    console.log('\n3. 检查用户详情...');
    try {
      const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 用户详情:', {
        id: userResponse.data.id,
        username: userResponse.data.username,
        role: userResponse.data.role?.name || 'undefined',
        roleId: userResponse.data.role?.id
      });
    } catch (error) {
      console.log('❌ 获取用户详情失败:', error.response?.status, error.response?.data);
    }

    // 4. 尝试访问钱包余额
    console.log('\n4. 尝试访问钱包余额...');
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

    // 5. 检查JWT token
    console.log('\n5. 检查JWT token...');
    console.log('JWT长度:', jwt.length);
    console.log('JWT前50字符:', jwt.substring(0, 50) + '...');

    // 6. 尝试直接访问API
    console.log('\n6. 尝试直接访问API...');
    try {
      const testResponse = await axios.get(`${BASE_URL}/api/subscription-plans`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 直接API访问成功');
    } catch (error) {
      console.log('❌ 直接API访问失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 调试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行调试
debugUserRole(); 