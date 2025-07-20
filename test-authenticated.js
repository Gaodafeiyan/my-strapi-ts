const axios = require('axios');

async function testAuthenticated() {
  try {
    console.log('🔍 测试带认证的API...');
    
    // 1. 注册用户获取token
    console.log('\n1. 注册用户...');
    const username = 'testuser' + Math.floor(Math.random() * 1000000);
    const registerResponse = await axios.post('http://118.107.4.158:1337/api/auth/invite-register', {
      username,
      email: `${username}@example.com`,
      password: 'password123'
    });
    
    const token = registerResponse.data.jwt;
    console.log('✅ 注册成功，用户ID:', registerResponse.data.user.id);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. 测试wallet-balance
    console.log('\n2. 测试wallet-balance API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/wallet-balances/my', { headers });
      console.log('✅ Wallet-balance API成功:', response.data);
    } catch (error) {
      console.log('❌ Wallet-balance API失败:', error.response?.data || error.message);
    }
    
    // 3. 测试subscription-order
    console.log('\n3. 测试subscription-order API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/subscription-orders/my', { headers });
      console.log('✅ Subscription-order API成功:', response.data);
    } catch (error) {
      console.log('❌ Subscription-order API失败:', error.response?.data || error.message);
    }
    
    // 4. 测试referral-reward
    console.log('\n4. 测试referral-reward API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/referral-rewards/my', { headers });
      console.log('✅ Referral-reward API成功:', response.data);
    } catch (error) {
      console.log('❌ Referral-reward API失败:', error.response?.data || error.message);
    }
    
    // 5. 测试usdt-withdraw
    console.log('\n5. 测试usdt-withdraw API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/usdt-withdraws/my', { headers });
      console.log('✅ USDT-withdraw API成功:', response.data);
    } catch (error) {
      console.log('❌ USDT-withdraw API失败:', error.response?.data || error.message);
    }
    
    // 6. 测试deposit-address
    console.log('\n6. 测试deposit-address API...');
    try {
      const response = await axios.get('http://118.107.4.158:1337/api/wallet-balances/deposit-address', { headers });
      console.log('✅ Deposit-address API成功:', response.data);
    } catch (error) {
      console.log('❌ Deposit-address API失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testAuthenticated(); 