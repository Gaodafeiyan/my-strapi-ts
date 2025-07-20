const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function debugRoles() {
  console.log('🔍 调试角色配置...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 注册用户
    const username = 'roleuser_' + Math.random().toString(36).substring(2, 8);
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

    // 2. 等待lifecycle执行
    console.log('\n2. 等待lifecycle执行...');
    await new Promise(resolve => setTimeout(resolve, 3000));

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

    // 5. 检查服务器日志
    console.log('\n5. 检查服务器日志...');
    console.log('请查看服务器控制台输出，应该能看到lifecycle的执行日志');

  } catch (error) {
    console.log('❌ 调试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行调试
debugRoles(); 