const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function setupRoles() {
  console.log('🔧 设置Strapi默认角色...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 检查现有角色
    console.log('1. 检查现有角色...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/users-permissions/roles`);
      console.log('✅ 现有角色:', rolesResponse.data.roles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description
      })));
    } catch (error) {
      console.log('❌ 无法获取角色列表:', error.response?.status, error.response?.data);
    }

    // 2. 尝试创建默认角色
    console.log('\n2. 尝试创建默认角色...');
    
    // 创建authenticated角色
    const authenticatedRole = {
      name: 'authenticated',
      description: 'Default role given to authenticated user.',
      permissions: {
        'api::subscription-plan.subscription-plan': {
          controllers: {
            'subscription-plan': {
              find: { enabled: true, policy: '' },
              findOne: { enabled: true, policy: '' }
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
        'api::wallet-balance.wallet-balance': {
          controllers: {
            'wallet-balance': {
              findMine: { enabled: true, policy: '' },
              getAddr: { enabled: true, policy: '' },
              adminRecharge: { enabled: true, policy: '' }
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
      }
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/api/users-permissions/roles`, authenticatedRole);
      console.log('✅ authenticated角色创建成功:', createResponse.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log('✅ authenticated角色已存在');
      } else {
        console.log('❌ 创建authenticated角色失败:', error.response?.status, error.response?.data);
      }
    }

    // 3. 测试注册
    console.log('\n3. 测试用户注册...');
    try {
      const username = 'testuser_' + Math.random().toString(36).substring(2, 8);
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: username,
        email: `${username}@example.com`,
        password: 'password123',
      });

      console.log('✅ 用户注册成功:', {
        id: registerResponse.data.user.id,
        username: registerResponse.data.user.username,
        role: registerResponse.data.user.role
      });

      // 4. 测试API访问
      console.log('\n4. 测试API访问...');
      const jwt = registerResponse.data.jwt;
      
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
      console.log('❌ 用户注册失败:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ 设置失败:', error.message);
  }
}

// 运行设置
setupRoles(); 