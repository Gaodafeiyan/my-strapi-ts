const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function debugAuth() {
  console.log('🔍 详细认证调试...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 注册用户
    console.log('1. 注册新用户...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: 'debuguser',
      email: 'debug@example.com',
      password: 'password123',
    });

    const { jwt, user } = registerResponse.data;
    console.log('✅ 用户注册成功:', {
      id: user.id,
      username: user.username,
      role: user.role?.name || 'undefined'
    });

    // 2. 检查用户详情
    console.log('\n2. 检查用户详情...');
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

    // 3. 检查角色权限
    console.log('\n3. 检查角色权限...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/users-permissions/roles`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      const authenticatedRole = rolesResponse.data.roles.find(r => r.name === 'authenticated');
      console.log('✅ 认证角色信息:', {
        id: authenticatedRole?.id,
        name: authenticatedRole?.name,
        description: authenticatedRole?.description
      });
      
      if (authenticatedRole) {
        console.log('✅ 认证角色权限:', authenticatedRole.permissions);
      }
    } catch (error) {
      console.log('❌ 无法获取角色信息:', error.response?.status);
    }

    // 4. 测试购买订单
    console.log('\n4. 测试购买订单...');
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
        state: orderResponse.data.state
      });
    } catch (error) {
      console.log('❌ 购买订单失败:', error.response?.status);
      console.log('错误详情:', error.response?.data);
    }

  } catch (error) {
    console.log('❌ 调试失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
}

// 运行调试
debugAuth(); 