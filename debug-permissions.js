const axios = require('axios');

async function debugPermissions() {
  try {
    console.log('🔍 开始调试权限问题...');
    
    // 1. 检查Authenticated角色的权限
    console.log('\n1. 检查Authenticated角色权限...');
    const rolesResponse = await axios.get('http://118.107.4.158:1337/api/users-permissions/roles');
    console.log('角色列表:', JSON.stringify(rolesResponse.data, null, 2));
    
    // 2. 获取Authenticated角色的详细权限
    const authenticatedRole = rolesResponse.data.roles.find(r => r.type === 'authenticated');
    if (authenticatedRole) {
      console.log('\n2. Authenticated角色权限详情:');
      console.log(JSON.stringify(authenticatedRole, null, 2));
      
      // 检查wallet-balance权限
      const walletPermissions = authenticatedRole.permissions['api::wallet-balance.wallet-balance'];
      console.log('\n3. Wallet-balance权限:', walletPermissions);
      
      // 检查subscription-order权限
      const orderPermissions = authenticatedRole.permissions['api::subscription-order.subscription-order'];
      console.log('\n4. Subscription-order权限:', orderPermissions);
    }
    
    // 3. 测试用户注册
    console.log('\n5. 测试用户注册...');
    const username = 'testuser' + Math.floor(Math.random() * 1000000);
    const registerResponse = await axios.post('http://118.107.4.158:1337/api/auth/invite-register', {
      username,
      email: `${username}@example.com`,
      password: 'password123'
    });
    
    const token = registerResponse.data.jwt;
    console.log('注册成功，用户ID:', registerResponse.data.user.id);
    
    // 4. 检查用户角色
    console.log('\n6. 检查用户角色...');
    const meResponse = await axios.get('http://118.107.4.158:1337/api/users/me?populate=role', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('用户信息:', JSON.stringify(meResponse.data, null, 2));
    
    // 5. 测试API调用
    console.log('\n7. 测试API调用...');
    
    // 测试wallet-balance
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
    console.error('❌ 调试失败:', error.response?.data || error.message);
  }
}

debugPermissions(); 