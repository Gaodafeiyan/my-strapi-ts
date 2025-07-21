#!/usr/bin/env node

/**
 * 快速用户 Schema 修复脚本
 * 用于在服务器上直接修复用户模型中缺失的字段
 */

const axios = require('axios');
const { customAlphabet } = require('nanoid');

const BASE_URL = 'http://118.107.4.158:1337';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 9);

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

async function quickFixUserSchema() {
  log('🚀 开始快速用户 Schema 修复...', 'blue');
  log('=' * 50, 'blue');

  try {
    // 1. 检查服务器状态
    log('\n1. 检查服务器状态...', 'yellow');
    try {
      await axios.get(`${BASE_URL}/admin`);
      log('✅ 服务器正常运行', 'green');
    } catch (error) {
      log('❌ 服务器无法访问', 'red');
      return;
    }

    // 2. 获取现有用户
    log('\n2. 获取现有用户...', 'yellow');
    let users = [];
    try {
      const response = await axios.get(`${BASE_URL}/api/users`);
      users = response.data.data || [];
      log(`✅ 找到 ${users.length} 个用户`, 'green');
    } catch (error) {
      log('❌ 无法获取用户列表', 'red');
      return;
    }

    // 3. 检查并修复用户字段
    log('\n3. 检查并修复用户字段...', 'yellow');
    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const updates = {};
      
      if (!user.attributes.diamondId) {
        updates.diamondId = nanoid();
        log(`➕ 为用户 ${user.id} 生成 diamondId: ${updates.diamondId}`, 'yellow');
      }
      
      if (!user.attributes.referralCode) {
        updates.referralCode = nanoid();
        log(`➕ 为用户 ${user.id} 生成 referralCode: ${updates.referralCode}`, 'yellow');
      }
      
      if (Object.keys(updates).length > 0) {
        try {
          await axios.put(`${BASE_URL}/api/users/${user.id}`, {
            data: updates
          });
          log(`✅ 用户 ${user.id} 修复成功`, 'green');
          fixedCount++;
        } catch (error) {
          log(`❌ 用户 ${user.id} 修复失败: ${error.response?.data?.error?.message || error.message}`, 'red');
          errorCount++;
        }
      } else {
        log(`✅ 用户 ${user.id} 字段已完整`, 'green');
      }
    }

    // 4. 测试新用户注册
    log('\n4. 测试新用户注册...', 'yellow');
    try {
      const testUsername = 'test_' + Math.random().toString(36).substring(2, 8);
      const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: 'password123'
      });

      if (response.data.user && response.data.user.diamondId && response.data.user.referralCode) {
        log('✅ 新用户注册测试成功', 'green');
        log(`   用户ID: ${response.data.user.id}`, 'green');
        log(`   DiamondID: ${response.data.user.diamondId}`, 'green');
        log(`   ReferralCode: ${response.data.user.referralCode}`, 'green');
        
        // 清理测试用户
        try {
          await axios.delete(`${BASE_URL}/api/users/${response.data.user.id}`);
          log('✅ 测试用户清理完成', 'green');
        } catch (cleanupError) {
          log('⚠️  测试用户清理失败，请手动删除', 'yellow');
        }
      } else {
        log('❌ 新用户注册测试失败', 'red');
      }
    } catch (error) {
      log('❌ 新用户注册测试失败:', error.response?.data?.error?.message || error.message, 'red');
    }

    // 5. 生成修复报告
    log('\n5. 修复报告...', 'yellow');
    log(`📊 总用户数: ${users.length}`, 'blue');
    log(`✅ 修复成功: ${fixedCount}`, 'green');
    log(`❌ 修复失败: ${errorCount}`, 'red');
    log(`✅ 无需修复: ${users.length - fixedCount - errorCount}`, 'green');

    if (errorCount > 0) {
      log('\n⚠️  有用户修复失败，请检查日志', 'yellow');
    } else {
      log('\n🎉 所有用户字段修复完成！', 'green');
    }

    // 6. 提供后续操作建议
    log('\n📋 后续操作建议:', 'blue');
    log('1. 重启 Strapi 服务以应用 Schema 更改', 'blue');
    log('2. 检查管理界面中的用户字段', 'blue');
    log('3. 测试邀请注册功能', 'blue');
    log('4. 运行完整 API 测试', 'blue');

  } catch (error) {
    log('💥 修复过程中发生错误: ' + error.message, 'red');
    process.exit(1);
  }
}

// 运行修复
if (require.main === module) {
  quickFixUserSchema();
}

module.exports = { quickFixUserSchema }; 