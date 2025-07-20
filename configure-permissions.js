const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function configurePermissions() {
  console.log('🔧 配置Strapi权限...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 获取现有角色
    console.log('1. 获取现有角色...');
    const rolesResponse = await axios.get(`${BASE_URL}/api/users-permissions/roles`);
    const authenticatedRole = rolesResponse.data.roles.find(r => r.name === 'Authenticated');
    
    if (!authenticatedRole) {
      console.log('❌ 未找到Authenticated角色');
      return;
    }

    console.log('✅ 找到Authenticated角色:', {
      id: authenticatedRole.id,
      name: authenticatedRole.name
    });

    // 2. 配置权限
    console.log('\n2. 配置权限...');
    const permissions = {
      ...authenticatedRole.permissions,
      'api::wallet-balance.wallet-balance': {
        controllers: {
          'wallet-balance': {
            findMine: { enabled: true, policy: '' },
            getAddr: { enabled: true, policy: '' },
            adminRecharge: { enabled: true, policy: '' }
          }
        }
      },
      'api::subscription-order.subscription-order': {
        controllers: {
          'subscription-order': {
            create: { enabled: true, policy: '' },
            findMy: { enabled: true, policy: '' },
            redeemManual: { enabled: true, policy: '' }
          }
        }
      },
      'api::usdt-withdraw.usdt-withdraw': {
        controllers: {
          'usdt-withdraw': {
            create: { enabled: true, policy: '' },
            findMine: { enabled: true, policy: '' },
            confirm: { enabled: true, policy: '' }
          }
        }
      },
      'api::referral-reward.referral-reward': {
        controllers: {
          'referral-reward': {
            findMy: { enabled: true, policy: '' }
          }
        }
      }
    };

    // 3. 更新角色权限
    console.log('\n3. 更新角色权限...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/users-permissions/roles/${authenticatedRole.id}`, {
        name: authenticatedRole.name,
        description: authenticatedRole.description,
        permissions: permissions
      });

      console.log('✅ 权限更新成功');
    } catch (error) {
      console.log('❌ 权限更新失败:', error.response?.status, error.response?.data);
    }

    // 4. 测试权限
    console.log('\n4. 测试权限...');
    try {
      const username = 'permissionuser_' + Math.random().toString(36).substring(2, 8);
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: username,
        email: `${username}@example.com`,
        password: 'password123',
      });

      const { jwt } = registerResponse.data;
      console.log('✅ 用户注册成功');

      // 测试钱包余额访问
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

    } catch (error) {
      console.log('❌ 测试失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 配置失败:', error.message);
  }
}

// 运行配置
configurePermissions(); 