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

async function testReferralRewardSystem() {
  log('🚀 开始测试推荐奖励制度...', 'blue');
  log('=' * 60, 'blue');

  let inviter = null;
  let invitee1 = null;
  let invitee2 = null;

  try {
    // 1. 注册邀请人
    log('\n1. 注册邀请人...', 'yellow');
    const inviterUsername = 'inviter_' + Math.random().toString(36).substring(2, 8);
    const inviterResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: inviterUsername,
      email: `${inviterUsername}@example.com`,
      password: 'password123'
    });

    inviter = inviterResponse.data;
    log('✅ 邀请人注册成功', 'green');
    log(`   用户ID: ${inviter.user.id}`, 'green');
    log(`   邀请码: ${inviter.user.referralCode}`, 'green');

    // 2. 注册被邀请人1
    log('\n2. 注册被邀请人1...', 'yellow');
    const invitee1Username = 'invitee1_' + Math.random().toString(36).substring(2, 8);
    const invitee1Response = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: invitee1Username,
      email: `${invitee1Username}@example.com`,
      password: 'password123',
      inviteCode: inviter.user.referralCode
    });

    invitee1 = invitee1Response.data;
    log('✅ 被邀请人1注册成功', 'green');
    log(`   用户ID: ${invitee1.user.id}`, 'green');
    log(`   邀请人ID: ${invitee1.user.invitedBy}`, 'green');

    // 3. 注册被邀请人2
    log('\n3. 注册被邀请人2...', 'yellow');
    const invitee2Username = 'invitee2_' + Math.random().toString(36).substring(2, 8);
    const invitee2Response = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: invitee2Username,
      email: `${invitee2Username}@example.com`,
      password: 'password123',
      inviteCode: inviter.user.referralCode
    });

    invitee2 = invitee2Response.data;
    log('✅ 被邀请人2注册成功', 'green');
    log(`   用户ID: ${invitee2.user.id}`, 'green');
    log(`   邀请人ID: ${invitee2.user.invitedBy}`, 'green');

    // 4. 给邀请人充值500U（PLAN500档位）
    log('\n4. 给邀请人充值500U...', 'yellow');
    await axios.post(`${BASE_URL}/api/wallet-balances/admin-recharge`, {
      userId: inviter.user.id,
      amount: 500
    }, {
      headers: { Authorization: `Bearer ${inviter.jwt}` }
    });
    log('✅ 邀请人充值500U成功', 'green');

    // 5. 邀请人购买PLAN500
    log('\n5. 邀请人购买PLAN500...', 'yellow');
    const inviterOrderResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
      planCode: 'PLAN500'
    }, {
      headers: { Authorization: `Bearer ${inviter.jwt}` }
    });
    log('✅ 邀请人购买PLAN500成功', 'green');
    log(`   订单ID: ${inviterOrderResponse.data.id}`, 'green');

    // 6. 给被邀请人1充值1000U
    log('\n6. 给被邀请人1充值1000U...', 'yellow');
    await axios.post(`${BASE_URL}/api/wallet-balances/admin-recharge`, {
      userId: invitee1.user.id,
      amount: 1000
    }, {
      headers: { Authorization: `Bearer ${invitee1.jwt}` }
    });
    log('✅ 被邀请人1充值1000U成功', 'green');

    // 7. 被邀请人1购买PLAN1K
    log('\n7. 被邀请人1购买PLAN1K...', 'yellow');
    const invitee1OrderResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
      planCode: 'PLAN1K'
    }, {
      headers: { Authorization: `Bearer ${invitee1.jwt}` }
    });
    log('✅ 被邀请人1购买PLAN1K成功', 'green');
    log(`   订单ID: ${invitee1OrderResponse.data.id}`, 'green');

    // 8. 给被邀请人2充值500U
    log('\n8. 给被邀请人2充值500U...', 'yellow');
    await axios.post(`${BASE_URL}/api/wallet-balances/admin-recharge`, {
      userId: invitee2.user.id,
      amount: 500
    }, {
      headers: { Authorization: `Bearer ${invitee2.jwt}` }
    });
    log('✅ 被邀请人2充值500U成功', 'green');

    // 9. 被邀请人2购买PLAN500
    log('\n9. 被邀请人2购买PLAN500...', 'yellow');
    const invitee2OrderResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
      planCode: 'PLAN500'
    }, {
      headers: { Authorization: `Bearer ${invitee2.jwt}` }
    });
    log('✅ 被邀请人2购买PLAN500成功', 'green');
    log(`   订单ID: ${invitee2OrderResponse.data.id}`, 'green');

    // 10. 手动赎回被邀请人1的订单（模拟到期）
    log('\n10. 手动赎回被邀请人1的订单...', 'yellow');
    await axios.post(`${BASE_URL}/api/subscription-orders/${invitee1OrderResponse.data.id}/redeem`, {}, {
      headers: { Authorization: `Bearer ${invitee1.jwt}` }
    });
    log('✅ 被邀请人1订单赎回成功', 'green');

    // 11. 手动赎回被邀请人2的订单（模拟到期）
    log('\n11. 手动赎回被邀请人2的订单...', 'yellow');
    await axios.post(`${BASE_URL}/api/subscription-orders/${invitee2OrderResponse.data.id}/redeem`, {}, {
      headers: { Authorization: `Bearer ${invitee2.jwt}` }
    });
    log('✅ 被邀请人2订单赎回成功', 'green');

    // 12. 检查邀请人的推荐奖励
    log('\n12. 检查邀请人的推荐奖励...', 'yellow');
    const rewardsResponse = await axios.get(`${BASE_URL}/api/referral-rewards/my`, {
      headers: { Authorization: `Bearer ${inviter.jwt}` }
    });

    log('✅ 获取推荐奖励成功', 'green');
    log(`   奖励记录数: ${rewardsResponse.data.length}`, 'green');
    
    if (rewardsResponse.data.length > 0) {
      rewardsResponse.data.forEach((reward, index) => {
        log(`   奖励${index + 1}: ${reward.amountUSDT} USDT`, 'green');
        log(`   描述: ${reward.description}`, 'green');
      });
    }

    // 13. 检查邀请人的钱包余额
    log('\n13. 检查邀请人的钱包余额...', 'yellow');
    const inviterWalletResponse = await axios.get(`${BASE_URL}/api/wallet-balances/my`, {
      headers: { Authorization: `Bearer ${inviter.jwt}` }
    });

    log('✅ 获取邀请人钱包余额成功', 'green');
    log(`   USDT余额: ${inviterWalletResponse.data.usdtBalance}`, 'green');
    log(`   AI Token余额: ${inviterWalletResponse.data.aiTokenBalance}`, 'green');

    // 14. 验证推荐奖励计算
    log('\n14. 验证推荐奖励计算...', 'yellow');
    
    // 被邀请人1投资1000U，静态收益60U，邀请人按500U档位获得100%奖励
    const expectedReward1 = 60; // 1000 * 6% * 100%
    
    // 被邀请人2投资500U，静态收益30U，邀请人按500U档位获得100%奖励
    const expectedReward2 = 30; // 500 * 6% * 100%
    
    const totalExpectedReward = expectedReward1 + expectedReward2;
    
    log(`   预期总奖励: ${totalExpectedReward} USDT`, 'blue');
    log(`   实际总奖励: ${rewardsResponse.data.reduce((sum, reward) => sum + reward.amountUSDT, 0)} USDT`, 'blue');
    
    if (rewardsResponse.data.length === 2) {
      log('✅ 推荐奖励计算正确！', 'green');
    } else {
      log('❌ 推荐奖励计算有误', 'red');
    }

    log('\n🎉 推荐奖励制度测试完成！', 'green');
    log('=' * 60, 'green');

    // 清理测试用户
    log('\n🧹 清理测试用户...', 'yellow');
    try {
      await axios.delete(`${BASE_URL}/api/users/${inviter.user.id}`);
      await axios.delete(`${BASE_URL}/api/users/${invitee1.user.id}`);
      await axios.delete(`${BASE_URL}/api/users/${invitee2.user.id}`);
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
  testReferralRewardSystem();
}

module.exports = { testReferralRewardSystem }; 