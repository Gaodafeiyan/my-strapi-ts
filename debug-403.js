const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function debug403() {
  console.log('🔍 403错误调试...\n');
  console.log(`📍 服务器: ${BASE_URL}\n`);

  try {
    // 1. 注册用户获取JWT
    console.log('1. 注册用户获取JWT...');
    const username = 'debuguser_' + Math.random().toString(36).substring(2, 8);
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

    // 2. 测试用户身份 (/users/me)
    console.log('\n2. 测试用户身份...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ /users/me 成功:', {
        id: meResponse.data.id,
        role: meResponse.data.role
      });
    } catch (error) {
      console.log('❌ /users/me 失败:', error.response?.status, error.response?.data);
    }

    // 3. 测试自动集合路由 (/api/wallet-balances)
    console.log('\n3. 测试自动集合路由...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ /api/wallet-balances 成功:', balanceResponse.data);
    } catch (error) {
      console.log('❌ /api/wallet-balances 失败:', error.response?.status, error.response?.data);
    }

    // 4. 测试自定义路由 (/api/wallet-balances/my)
    console.log('\n4. 测试自定义路由...');
    try {
      const myBalanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ /api/wallet-balances/my 成功:', myBalanceResponse.data);
    } catch (error) {
      console.log('❌ /api/wallet-balances/my 失败:', error.response?.status, error.response?.data);
    }

    // 5. 测试路由信息
    console.log('\n5. 测试路由信息...');
    try {
      const routesResponse = await axios.get(`${BASE_URL}/users-permissions/routes`);
      console.log('✅ 路由信息获取成功');
      
      // 查找钱包相关路由
      const walletRoutes = routesResponse.data.routes.filter(route => 
        route.path.includes('wallet') || route.path.includes('balance')
      );
      console.log('钱包相关路由:', walletRoutes.map(r => `${r.method} ${r.path}`));
    } catch (error) {
      console.log('❌ 路由信息获取失败:', error.response?.status);
    }

    // 6. 测试权限信息
    console.log('\n6. 测试权限信息...');
    try {
      const permissionsResponse = await axios.get(`${BASE_URL}/users-permissions/permissions`);
      console.log('✅ 权限信息获取成功');
      
      if (permissionsResponse.data.permissions['api::wallet-balance']) {
        console.log('钱包余额权限:', permissionsResponse.data.permissions['api::wallet-balance']);
      } else {
        console.log('❌ 未找到钱包余额权限配置');
      }
    } catch (error) {
      console.log('❌ 权限信息获取失败:', error.response?.status);
    }

  } catch (error) {
    console.log('❌ 调试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行调试
debug403(); 