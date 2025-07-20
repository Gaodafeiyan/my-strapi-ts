const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function createAdmin() {
  console.log('👑 创建管理员账号...\n');
  
  try {
    // 1. 检查是否已有管理员
    console.log('1. 检查现有管理员...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'admin@example.com',
        password: 'Admin123!',
      });
      console.log('✅ 管理员已存在，登录成功');
      return loginResponse.data.data.token;
    } catch (error) {
      console.log('❌ 管理员不存在或密码错误，需要创建');
    }

    // 2. 创建管理员账号
    console.log('\n2. 创建管理员账号...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/register`, {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@example.com',
        password: 'Admin123!',
      });

      console.log('✅ 管理员创建成功:', {
        id: createResponse.data.data.user.id,
        email: createResponse.data.data.user.email
      });

      return createResponse.data.data.token;
    } catch (error) {
      console.log('❌ 管理员创建失败:', error.response?.status, error.response?.data);
      
      // 3. 尝试使用默认管理员
      console.log('\n3. 尝试默认管理员...');
      const defaultAdmins = [
        { email: 'admin@strapi.io', password: 'Admin123!' },
        { email: 'admin@example.com', password: 'admin' },
        { email: 'admin@example.com', password: 'Admin123!' },
        { email: 'admin@example.com', password: 'password' },
      ];

      for (const admin of defaultAdmins) {
        try {
          const loginResponse = await axios.post(`${BASE_URL}/admin/login`, admin);
          console.log('✅ 默认管理员登录成功:', admin.email);
          return loginResponse.data.data.token;
        } catch (error) {
          console.log(`❌ ${admin.email} 登录失败`);
        }
      }

      throw new Error('无法创建或登录管理员账号');
    }

  } catch (error) {
    console.log('❌ 创建管理员失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
    return null;
  }
}

(async () => {
  console.log('🔧 修复Strapi权限配置...\n');
  
  try {
    // 1. 创建或登录管理员
    const adminToken = await createAdmin();
    if (!adminToken) {
      console.log('❌ 无法获取管理员权限');
      return;
    }

    const api = axios.create({ 
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    // 2. 找到 Authenticated 角色 id
    console.log('\n4. 获取角色信息...');
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
    console.log('\n5. 配置权限...');
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
    console.log('\n6. 更新角色权限...');
    await api.put(`/users-permissions/roles/${authRole.id}`, {
      name: authRole.name,
      description: authRole.description,
      permissions: permissions
    });

    console.log('✅ 权限配置完成');

    // 5. 测试权限
    console.log('\n7. 测试权限...');
    try {
      const username = 'testuser_' + Math.random().toString(36).substring(2, 8);
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
    console.log('❌ 修复失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
  }
})(); 