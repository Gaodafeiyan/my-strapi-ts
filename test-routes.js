const axios = require('axios');

async function testRoutes() {
  try {
    console.log('🔍 测试路由注册...');
    
    // 测试基本API
    console.log('\n1. 测试基本API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/users/me');
      console.log('✅ /api/users/me 可用');
    } catch (error) {
      console.log('❌ /api/users/me 不可用:', error.response?.status);
    }
    
    // 测试auth API
    console.log('\n2. 测试auth API...');
    try {
      const response = await axios.post('http://118.107.4.158:1337/api/auth/invite-register', {
        username: 'testuser' + Math.floor(Math.random() * 1000000),
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ /api/auth/invite-register 可用');
    } catch (error) {
      console.log('❌ /api/auth/invite-register 不可用:', error.response?.status);
    }
    
    // 测试wallet-balance路由
    console.log('\n3. 测试wallet-balance路由...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/wallet-balances/my');
      console.log('✅ /api/wallet-balances/my 可用');
    } catch (error) {
      console.log('❌ /api/wallet-balances/my 不可用:', error.response?.status);
    }
    
    // 测试subscription-order路由
    console.log('\n4. 测试subscription-order路由...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/subscription-orders/my');
      console.log('✅ /api/subscription-orders/my 可用');
    } catch (error) {
      console.log('❌ /api/subscription-orders/my 不可用:', error.response?.status);
    }
    
    // 测试referral-reward路由
    console.log('\n5. 测试referral-reward路由...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/referral-rewards/mine');
      console.log('✅ /api/referral-rewards/mine 可用');
    } catch (error) {
      console.log('❌ /api/referral-rewards/mine 不可用:', error.response?.status);
    }
    
    // 测试usdt-withdraw路由
    console.log('\n6. 测试usdt-withdraw路由...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/usdt-withdraws/my');
      console.log('✅ /api/usdt-withdraws/my 可用');
    } catch (error) {
      console.log('❌ /api/usdt-withdraws/my 不可用:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRoutes(); 