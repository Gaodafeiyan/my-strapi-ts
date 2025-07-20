const axios = require('axios');

(async () => {
  console.log('🔧 修复Strapi权限配置...\n');
  
  const api = axios.create({ baseURL: 'http://118.107.4.158:1337' });
  
  try {
    // 1. 管理员登录换取 JWT
    console.log('1. 管理员登录...');
    const { data: login } = await api.post('/admin/login', {
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    api.defaults.headers.common.Authorization = `Bearer ${login.data.token}`;
    console.log('✅ 管理员登录成功');

    // 2. 找到 Authenticated 角色 id
    console.log('\n2. 获取角色信息...');
    const { data: roles } = await api.get('/users-permissions/roles');
    const authRole = roles.roles.find(r => r.type === 'authenticated');
    
    if (!authRole) {
      console.log('❌ 未找到Authenticated角色');
      return;
    }
    
    console.log('✅ 找到Authenticated角色:', {
      id: authRole.id,
      name: authRole.name,
      type: authRole.type
    });

    // 3. 配置完整权限
    console.log('\n3. 配置权限...');
    const permissions = {
      ...authRole.permissions,
      'api::wallet-balance.wallet-balance': {
        controllers: {
          'wallet-balance': { 
            find: { enabled: true, policy: '' },
            findMine: { enabled: true, policy: '' },
            getAddr: { enabled: true, policy: '' },
            adminRecharge: { enabled: true, policy: '' }
          },
        },
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

    // 4. 更新角色权限
    console.log('\n4. 更新角色权限...');
    await api.put(`/users-permissions/roles/${authRole.id}`, {
      name: authRole.name,
      description: authRole.description,
      permissions: permissions
    });

    console.log('✅ 权限配置完成');

    // 5. 测试权限
    console.log('\n5. 测试权限...');
    const username = 'testuser_' + Math.random().toString(36).substring(2, 8);
    const registerResponse = await api.post('/api/auth/invite-register', {
      username: username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    const { jwt } = registerResponse.data;
    console.log('✅ 用户注册成功');

    // 测试钱包余额访问
    try {
      const balanceResponse = await api.get('/api/wallet-balances/my', {
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
    console.log('❌ 修复失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
})(); 