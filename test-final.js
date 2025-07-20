const axios = require('axios');

async function testFinal() {
  try {
    console.log('🎯 最终测试 - 使用正确的policy配置');
    
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
    
    // 2. 测试所有API
    console.log('\n2. 测试所有API...');
    
    const apis = [
      { name: 'Wallet Balance', url: '/api/wallet-balances/my' },
      { name: 'Deposit Address', url: '/api/wallet-balances/deposit-address' },
      { name: 'Subscription Orders', url: '/api/subscription-orders/my' },
      { name: 'Referral Rewards', url: '/api/referral-rewards/my' },
      { name: 'USDT Withdraws', url: '/api/usdt-withdraws/my' }
    ];
    
    for (const api of apis) {
      try {
        console.log(`\n测试 ${api.name}...`);
        const response = await axios.get(`http://118.107.4.158:1337${api.url}`, { headers });
        console.log(`✅ ${api.name} 成功:`, response.data);
      } catch (error) {
        console.log(`❌ ${api.name} 失败:`, error.response?.data || error.message);
      }
    }
    
    // 3. 测试POST API
    console.log('\n3. 测试POST API...');
    
    try {
      console.log('测试创建订阅订单...');
      const orderResponse = await axios.post('http://118.107.4.158:1337/api/subscription-orders', {
        planCode: 'basic'
      }, { headers });
      console.log('✅ 创建订阅订单成功:', orderResponse.data);
    } catch (error) {
      console.log('❌ 创建订阅订单失败:', error.response?.data || error.message);
    }
    
    try {
      console.log('测试创建USDT提现...');
      const withdrawResponse = await axios.post('http://118.107.4.158:1337/api/usdt-withdraws', {
        amount: 10,
        address: '0x1234567890123456789012345678901234567890',
        network: 'BEP20'
      }, { headers });
      console.log('✅ 创建USDT提现成功:', withdrawResponse.data);
    } catch (error) {
      console.log('❌ 创建USDT提现失败:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testFinal(); 