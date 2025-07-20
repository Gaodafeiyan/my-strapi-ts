const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function fixPermissionsDB() {
  console.log('🔧 直接修改数据库权限...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 尝试直接访问数据库权限
    console.log('1. 检查数据库权限配置...');
    
    // 2. 创建测试用户
    const username = 'richuser_' + Math.random().toString(36).substring(2, 8);
    console.log('\n2. 创建测试用户...');
    
    try {
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

      // 3. 测试API访问
      console.log('\n3. 测试API访问...');
      
      // 测试钱包余额
      try {
        const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        console.log('✅ 钱包余额访问成功');
      } catch (error) {
        console.log('❌ 钱包余额访问失败:', error.response?.status);
      }

      // 测试充值
      try {
        const rechargeResponse = await axios.post(`${BASE_URL}/api/wallet-balances/admin-recharge`, {
          userId: user.id,
          amount: 100000000
        }, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        console.log('✅ 充值功能正常');
      } catch (error) {
        console.log('❌ 充值功能失败:', error.response?.status);
      }

      // 测试购买订单
      try {
        const orderResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
          planCode: 'PLAN500'
        }, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        console.log('✅ 购买订单功能正常');
      } catch (error) {
        console.log('❌ 购买订单失败:', error.response?.status);
      }

    } catch (error) {
      console.log('❌ 用户注册失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

// 运行测试
fixPermissionsDB(); 