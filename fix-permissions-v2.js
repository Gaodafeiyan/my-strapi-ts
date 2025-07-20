const axios = require('axios');

async function fixPermissionsV2() {
  try {
    console.log('🔧 开始修复权限 V2...');
    
    // 1. 获取当前权限
    console.log('\n1. 获取当前权限...');
    const rolesResponse = await axios.get('http://118.107.4.158:1337/api/users-permissions/roles');
    const authenticatedRole = rolesResponse.data.roles.find(r => r.type === 'authenticated');
    
    if (!authenticatedRole) {
      console.log('❌ 找不到Authenticated角色');
      return;
    }
    
    console.log('找到Authenticated角色:', authenticatedRole.id);
    
    // 2. 构建正确的权限对象
    const permissions = {
      'api::wallet-balance': {
        controllers: {
          'wallet-balance': {
            findMine: { enabled: true, policy: '' },
            getAddr: { enabled: true, policy: '' },
            adminRecharge: { enabled: true, policy: '' }
          }
        }
      },
      'api::subscription-order': {
        controllers: {
          'subscription-order': {
            findMine: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' }
          }
        }
      },
      'api::referral-reward': {
        controllers: {
          'referral-reward': {
            findMine: { enabled: true, policy: '' }
          }
        }
      },
      'api::usdt-withdraw': {
        controllers: {
          'usdt-withdraw': {
            findMy: { enabled: true, policy: '' },
            create: { enabled: true, policy: '' }
          }
        }
      }
    };
    
    // 3. 更新权限
    console.log('\n2. 更新权限...');
    const updateResponse = await axios.put(`http://118.107.4.158:1337/api/users-permissions/roles/${authenticatedRole.id}`, {
      name: authenticatedRole.name,
      description: authenticatedRole.description,
      type: authenticatedRole.type,
      permissions: permissions
    });
    
    console.log('✅ 权限更新成功:', updateResponse.data);
    
    // 4. 测试权限
    console.log('\n3. 测试权限...');
    const username = 'testuser' + Math.floor(Math.random() * 1000000);
    const registerResponse = await axios.post('http://118.107.4.158:1337/api/auth/invite-register', {
      username,
      email: `${username}@example.com`,
      password: 'password123'
    });
    
    const token = registerResponse.data.jwt;
    console.log('注册成功，用户ID:', registerResponse.data.user.id);
    
    // 测试API
    try {
      const walletResponse = await axios.get('http://118.107.4.158:1337/api/wallet-balances/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Wallet-balance API成功:', walletResponse.data);
    } catch (error) {
      console.log('❌ Wallet-balance API失败:', error.response?.data || error.message);
    }
    
    // 测试subscription-order
    try {
      const orderResponse = await axios.get('http://118.107.4.158:1337/api/subscription-orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Subscription-order API成功:', orderResponse.data);
    } catch (error) {
      console.log('❌ Subscription-order API失败:', error.response?.data || error.message);
    }
    
    // 测试referral-reward
    try {
      const referralResponse = await axios.get('http://118.107.4.158:1337/api/referral-rewards/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Referral-reward API成功:', referralResponse.data);
    } catch (error) {
      console.log('❌ Referral-reward API失败:', error.response?.data || error.message);
    }
    
    // 测试usdt-withdraw
    try {
      const withdrawResponse = await axios.get('http://118.107.4.158:1337/api/usdt-withdraws/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ USDT-withdraw API成功:', withdrawResponse.data);
    } catch (error) {
      console.log('❌ USDT-withdraw API失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.response?.data || error.message);
  }
}

fixPermissionsV2(); 