const fetch = require('node-fetch');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const USERNAME = 'your_username'; // 请替换为你的用户名
const PASSWORD = 'your_password'; // 请替换为你的密码

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取 token
async function login() {
  log('🔐 正在登录...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: USERNAME,
        password: PASSWORD,
      }),
    });
    
    const data = await response.json();
    
    if (data.jwt) {
      log('✅ 登录成功！', 'green');
      return data.jwt;
    } else {
      log('❌ 登录失败: ' + JSON.stringify(data), 'red');
      throw new Error('登录失败');
    }
  } catch (error) {
    log('❌ 登录异常: ' + error.message, 'red');
    throw error;
  }
}

// 测试 API 接口
async function testApi(path, method = 'GET', token, body = null, description = '') {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ [${method}] ${path} - ${description}`, 'green');
      console.log('   返回数据:', JSON.stringify(data, null, 2));
    } else {
      log(`❌ [${method}] ${path} - ${description} (${response.status})`, 'red');
      console.log('   错误信息:', JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    log(`❌ [${method}] ${path} - ${description} (异常)`, 'red');
    console.log('   异常信息:', error.message);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runAllTests() {
  log('🚀 开始测试所有后端 API 接口...', 'blue');
  log('=' * 50, 'blue');
  
  try {
    // 1. 登录获取 token
    const token = await login();
    log('', 'reset');
    
    // 2. 测试用户相关接口
    log('👤 测试用户相关接口...', 'yellow');
    await testApi('/api/users/me', 'GET', token, null, '获取当前用户信息');
    log('', 'reset');
    
    // 3. 测试钱包相关接口
    log('💰 测试钱包相关接口...', 'yellow');
    await testApi('/api/wallet-balances/my', 'GET', token, null, '获取我的钱包余额');
    await testApi('/api/wallet-balances/deposit-address', 'GET', token, null, '获取充值地址');
    log('', 'reset');
    
    // 4. 测试投资/认购相关接口
    log('📈 测试投资/认购相关接口...', 'yellow');
    await testApi('/api/subscription-plans', 'GET', token, null, '获取认购计划');
    await testApi('/api/subscription-orders', 'GET', token, null, '获取认购订单');
    await testApi('/api/investment-orders', 'GET', token, null, '获取投资订单');
    log('', 'reset');
    
    // 5. 测试抽奖相关接口
    log('🎰 测试抽奖相关接口...', 'yellow');
    await testApi('/api/lottery-configs', 'GET', token, null, '获取抽奖配置');
    await testApi('/api/lottery-prizes', 'GET', token, null, '获取奖品列表');
    await testApi('/api/lottery-spins', 'GET', token, null, '获取抽奖记录');
    log('', 'reset');
    
    // 6. 测试推荐相关接口
    log('👥 测试推荐相关接口...', 'yellow');
    await testApi('/api/referral-rewards', 'GET', token, null, '获取推荐奖励');
    log('', 'reset');
    
    // 7. 测试提现相关接口
    log('💸 测试提现相关接口...', 'yellow');
    await testApi('/api/withdraw-requests', 'GET', token, null, '获取提现记录');
    log('', 'reset');
    
    // 8. 测试其他可能存在的接口
    log('🔍 测试其他接口...', 'yellow');
    await testApi('/api/wallet-txes', 'GET', token, null, '获取交易记录');
    await testApi('/api/deposit-addresses', 'GET', token, null, '获取充值地址列表');
    log('', 'reset');
    
    log('🎉 所有接口测试完成！', 'green');
    
  } catch (error) {
    log('💥 测试过程中发生错误: ' + error.message, 'red');
  }
}

// 运行测试
if (require.main === module) {
  // 检查是否配置了用户名和密码
  if (USERNAME === 'your_username' || PASSWORD === 'your_password') {
    log('⚠️  请先修改脚本中的 USERNAME 和 PASSWORD 为你的实际登录信息！', 'yellow');
    log('   然后运行: node test_all_apis.js', 'blue');
  } else {
    runAllTests();
  }
}

module.exports = { runAllTests, testApi, login }; 