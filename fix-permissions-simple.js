const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function fixPermissions() {
  console.log('🔧 直接修复权限配置...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 直接配置权限 - 通过数据库或配置文件
    console.log('1. 检查当前权限状态...');
    
    // 2. 创建测试用户并检查权限
    const username = 'testuser_' + Math.random().toString(36).substring(2, 8);
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

      // 3. 测试钱包余额访问
      console.log('\n3. 测试钱包余额访问...');
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

        // 4. 测试充值功能
        console.log('\n4. 测试充值功能...');
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

      } catch (error) {
        console.log('❌ 钱包余额访问失败:', error.response?.status, error.response?.data);
        
        // 如果403，说明权限问题，提供解决方案
        if (error.response?.status === 403) {
          console.log('\n🔧 权限问题解决方案:');
          console.log('1. 访问 http://118.107.4.158:1337/admin');
          console.log('2. 进入 Settings → Roles');
          console.log('3. 点击 Authenticated 角色');
          console.log('4. 在左侧找到 wallet-balance');
          console.log('5. 勾选 find 和 findMine');
          console.log('6. 保存并重启Strapi');
        }
      }

    } catch (error) {
      console.log('❌ 用户注册失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

// 运行测试
fixPermissions(); 