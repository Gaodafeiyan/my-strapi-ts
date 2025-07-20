const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testPermissions() {
  console.log('🔍 测试API权限...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 测试未认证访问
    console.log('1. 测试未认证访问 subscription-orders...');
    try {
      await axios.post(`${BASE_URL}/api/subscription-orders`, {
        planCode: 'PLAN500'
      });
      console.log('❌ 应该返回403，但返回了200');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 正确返回403 - 未认证访问被拒绝');
      } else {
        console.log('❌ 意外错误:', error.response?.status, error.message);
      }
    }

    // 2. 测试认证用户访问
    console.log('\n2. 测试认证用户访问...');
    try {
      // 先注册一个用户
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const { jwt } = registerResponse.data;
      console.log('✅ 用户注册成功，获得JWT');

      // 测试认证访问
      const authResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log('✅ 认证成功，用户信息:', {
        id: authResponse.data.id,
        username: authResponse.data.username,
        role: authResponse.data.role?.name
      });

      // 测试购买订单
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
      console.log('❌ 认证测试失败:', error.response?.status, error.message);
      if (error.response?.data) {
        console.log('错误详情:', error.response.data);
      }
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

// 运行测试
testPermissions(); 