const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

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

async function testCompleteAPI() {
  log('🚀 开始完整API测试...', 'blue');
  log('=' * 60, 'blue');

  let userA = null;
  let userB = null;
  let userC = null;

  try {
    // 1. 注册用户A（无邀请码）
    log('\n1. 注册用户A（无邀请码）...', 'yellow');
    const usernameA = 'testuserA_' + Math.random().toString(36).substring(2, 8);
    const responseA = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: usernameA,
      email: `${usernameA}@example.com`,
      password: 'password123'
    });

    userA = responseA.data;
    log('✅ 用户A注册成功', 'green');
    log(`   用户ID: ${userA.user.id}`, 'green');
    log(`   DiamondID: ${userA.user.diamondId}`, 'green');
    log(`   ReferralCode: ${userA.user.referralCode}`, 'green');

    // 2. 注册用户B（使用A的邀请码）
    log('\n2. 注册用户B（使用A的邀请码）...', 'yellow');
    const usernameB = 'testuserB_' + Math.random().toString(36).substring(2, 8);
    const responseB = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: usernameB,
      email: `${usernameB}@example.com`,
      password: 'password123',
      inviteCode: userA.user.referralCode
    });

    userB = responseB.data;
    log('✅ 用户B注册成功', 'green');
    log(`   用户ID: ${userB.user.id}`, 'green');
    log(`   邀请人ID: ${userB.user.invitedBy}`, 'green');

    // 3. 注册用户C（使用A的邀请码）
    log('\n3. 注册用户C（使用A的邀请码）...', 'yellow');
    const usernameC = 'testuserC_' + Math.random().toString(36).substring(2, 8);
    const responseC = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: usernameC,
      email: `${usernameC}@example.com`,
      password: 'password123',
      inviteCode: userA.user.referralCode
    });

    userC = responseC.data;
    log('✅ 用户C注册成功', 'green');
    log(`   用户ID: ${userC.user.id}`, 'green');
    log(`   邀请人ID: ${userC.user.invitedBy}`, 'green');

    // 4. 测试获取邀请码
    log('\n4. 测试获取邀请码...', 'yellow');
    const inviteCodeResponse = await axios.get(`${BASE_URL}/api/auth/my-invite-code`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取邀请码成功', 'green');
    log(`   邀请码: ${inviteCodeResponse.data.referralCode}`, 'green');
    log(`   邀请链接: ${inviteCodeResponse.data.inviteUrl}`, 'green');
    log(`   二维码链接: ${inviteCodeResponse.data.qrCodeUrl}`, 'green');

    // 5. 测试获取邀请统计
    log('\n5. 测试获取邀请统计...', 'yellow');
    const inviteStatsResponse = await axios.get(`${BASE_URL}/api/auth/invite-stats`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取邀请统计成功', 'green');
    log(`   总邀请数: ${inviteStatsResponse.data.totalInvites}`, 'green');
    log(`   总奖励: ${inviteStatsResponse.data.totalRewards}`, 'green');
    log(`   今日奖励: ${inviteStatsResponse.data.todayRewards}`, 'green');

    // 6. 测试获取邀请人列表
    log('\n6. 测试获取邀请人列表...', 'yellow');
    const invitedUsersResponse = await axios.get(`${BASE_URL}/api/auth/invited-users`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取邀请人列表成功', 'green');
    log(`   邀请人数: ${invitedUsersResponse.data.length}`, 'green');

    // 7. 测试钱包余额
    log('\n7. 测试钱包余额...', 'yellow');
    const walletResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取钱包余额成功', 'green');
    log(`   USDT余额: ${walletResponse.data.usdtBalance}`, 'green');
    log(`   AI Token余额: ${walletResponse.data.aiTokenBalance}`, 'green');

    // 8. 测试充值地址
    log('\n8. 测试充值地址...', 'yellow');
    const addressResponse = await axios.get(`${BASE_URL}/api/wallet-balances/deposit-address`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取充值地址成功', 'green');
    log(`   地址: ${addressResponse.data.address}`, 'green');
    log(`   网络: ${addressResponse.data.network}`, 'green');
    log(`   备注: ${addressResponse.data.memo}`, 'green');

    // 9. 测试推荐奖励查询
    log('\n9. 测试推荐奖励查询...', 'yellow');
    const rewardsResponse = await axios.get(`${BASE_URL}/api/referral-rewards/my`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取推荐奖励成功', 'green');
    log(`   奖励记录数: ${rewardsResponse.data.length}`, 'green');

    // 10. 测试订阅计划查询
    log('\n10. 测试订阅计划查询...', 'yellow');
    const plansResponse = await axios.get(`${BASE_URL}/api/subscription-plans`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取订阅计划成功', 'green');
    log(`   计划数量: ${plansResponse.data.length}`, 'green');

    // 11. 测试订阅订单查询
    log('\n11. 测试订阅订单查询...', 'yellow');
    const ordersResponse = await axios.get(`${BASE_URL}/api/subscription-orders/my`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取订阅订单成功', 'green');
    log(`   订单数量: ${ordersResponse.data.length}`, 'green');

    // 12. 测试提现记录查询
    log('\n12. 测试提现记录查询...', 'yellow');
    const withdrawsResponse = await axios.get(`${BASE_URL}/api/usdt-withdraws/my`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });

    log('✅ 获取提现记录成功', 'green');
    log(`   提现记录数: ${withdrawsResponse.data.length}`, 'green');

    // 13. 测试抽奖相关接口
    log('\n13. 测试抽奖相关接口...', 'yellow');
    
    // 获取抽奖配置
    const lotteryConfigResponse = await axios.get(`${BASE_URL}/api/lottery-configs`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });
    log('✅ 获取抽奖配置成功', 'green');

    // 获取奖品列表
    const lotteryPrizesResponse = await axios.get(`${BASE_URL}/api/lottery-prizes`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });
    log('✅ 获取奖品列表成功', 'green');

    // 获取抽奖记录
    const lotterySpinsResponse = await axios.get(`${BASE_URL}/api/lottery-spins`, {
      headers: { Authorization: `Bearer ${userA.jwt}` }
    });
    log('✅ 获取抽奖记录成功', 'green');

    log('\n🎉 所有API测试完成！', 'green');
    log('=' * 60, 'green');

    // 清理测试用户
    log('\n🧹 清理测试用户...', 'yellow');
    try {
      await axios.delete(`${BASE_URL}/api/users/${userA.user.id}`);
      await axios.delete(`${BASE_URL}/api/users/${userB.user.id}`);
      await axios.delete(`${BASE_URL}/api/users/${userC.user.id}`);
      log('✅ 测试用户清理完成', 'green');
    } catch (cleanupError) {
      log('⚠️  测试用户清理失败，请手动删除', 'yellow');
    }

  } catch (error) {
    log('💥 测试过程中发生错误: ' + error.message, 'red');
    if (error.response) {
      log('错误详情: ' + JSON.stringify(error.response.data, null, 2), 'red');
    }
  }
}

// 运行测试
if (require.main === module) {
  testCompleteAPI();
}

module.exports = { testCompleteAPI }; 