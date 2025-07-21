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

async function runUserSchemaFix() {
  log('🔧 开始完整的用户 Schema 修复流程...', 'blue');
  log('=' * 60, 'blue');

  try {
    // 1. 检查服务器状态
    log('\n1. 检查服务器状态...', 'yellow');
    try {
      const response = await axios.get(`${BASE_URL}/admin`);
      log('✅ Strapi 服务器正常运行', 'green');
    } catch (error) {
      log('❌ Strapi 服务器无法访问', 'red');
      return;
    }

    // 2. 重新构建应用以应用 Schema 更改
    log('\n2. 重新构建应用...', 'yellow');
    try {
      // 这里需要在实际环境中运行 strapi build
      log('⚠️  请在服务器上运行: npm run build', 'yellow');
      log('⚠️  然后重启 Strapi 服务', 'yellow');
    } catch (error) {
      log('❌ 构建失败:', error.message, 'red');
    }

    // 3. 配置用户权限
    log('\n3. 配置用户权限...', 'yellow');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/users-permissions/roles`);
      const authenticatedRole = rolesResponse.data.roles.find(r => r.name === 'Authenticated');
      
      if (authenticatedRole) {
        const permissions = {
          ...authenticatedRole.permissions,
          'plugin::users-permissions.user': {
            controllers: {
              'user': {
                me: { enabled: true, policy: '' },
                update: { enabled: true, policy: '' }
              }
            }
          }
        };

        await axios.put(`${BASE_URL}/api/users-permissions/roles/${authenticatedRole.id}`, {
          name: authenticatedRole.name,
          description: authenticatedRole.description,
          permissions: permissions
        });

        log('✅ 用户权限配置成功', 'green');
      } else {
        log('❌ 未找到 Authenticated 角色', 'red');
      }
    } catch (error) {
      log('❌ 权限配置失败:', error.response?.data || error.message, 'red');
    }

    // 4. 测试用户注册
    log('\n4. 测试用户注册...', 'yellow');
    try {
      const testUsername = 'testuser_' + Math.random().toString(36).substring(2, 8);
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: testUsername,
        email: `${testUsername}@example.com`,
        password: 'password123'
      });

      if (registerResponse.data.jwt && registerResponse.data.user) {
        log('✅ 用户注册测试成功', 'green');
        log(`   用户ID: ${registerResponse.data.user.id}`, 'green');
        log(`   DiamondID: ${registerResponse.data.user.diamondId}`, 'green');
        log(`   ReferralCode: ${registerResponse.data.user.referralCode}`, 'green');
        
        // 清理测试用户
        try {
          await axios.delete(`${BASE_URL}/api/users/${registerResponse.data.user.id}`);
          log('✅ 测试用户清理完成', 'green');
        } catch (cleanupError) {
          log('⚠️  测试用户清理失败，请手动删除', 'yellow');
        }
      } else {
        log('❌ 用户注册测试失败', 'red');
      }
    } catch (error) {
      log('❌ 用户注册测试失败:', error.response?.data || error.message, 'red');
    }

    // 5. 验证现有用户
    log('\n5. 验证现有用户...', 'yellow');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/users`);
      const users = usersResponse.data.data || [];
      
      let validUsers = 0;
      let invalidUsers = 0;
      
      for (const user of users) {
        if (user.attributes.diamondId && user.attributes.referralCode) {
          validUsers++;
        } else {
          invalidUsers++;
          log(`⚠️  用户 ${user.id} 缺少字段:`, 'yellow');
          if (!user.attributes.diamondId) log('   - diamondId', 'yellow');
          if (!user.attributes.referralCode) log('   - referralCode', 'yellow');
        }
      }
      
      log(`✅ 用户验证完成: ${validUsers} 个有效用户, ${invalidUsers} 个需要修复`, 'green');
      
      if (invalidUsers > 0) {
        log('\n6. 修复无效用户...', 'yellow');
        for (const user of users) {
          if (!user.attributes.diamondId || !user.attributes.referralCode) {
            const updates = {};
            if (!user.attributes.diamondId) {
              updates.diamondId = generateId();
            }
            if (!user.attributes.referralCode) {
              updates.referralCode = generateId();
            }
            
            try {
              await axios.put(`${BASE_URL}/api/users/${user.id}`, updates);
              log(`✅ 用户 ${user.id} 修复成功`, 'green');
            } catch (error) {
              log(`❌ 用户 ${user.id} 修复失败:`, error.response?.data || error.message, 'red');
            }
          }
        }
      }
    } catch (error) {
      log('❌ 用户验证失败:', error.response?.data || error.message, 'red');
    }

    // 7. 测试邀请注册
    log('\n7. 测试邀请注册...', 'yellow');
    try {
      // 先注册一个邀请人
      const inviterUsername = 'inviter_' + Math.random().toString(36).substring(2, 8);
      const inviterResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: inviterUsername,
        email: `${inviterUsername}@example.com`,
        password: 'password123'
      });

      if (inviterResponse.data.user.referralCode) {
        // 使用邀请码注册新用户
        const inviteeUsername = 'invitee_' + Math.random().toString(36).substring(2, 8);
        const inviteeResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
          username: inviteeUsername,
          email: `${inviteeUsername}@example.com`,
          password: 'password123',
          inviteCode: inviterResponse.data.user.referralCode
        });

        if (inviteeResponse.data.user) {
          log('✅ 邀请注册测试成功', 'green');
          log(`   邀请人: ${inviterResponse.data.user.username}`, 'green');
          log(`   被邀请人: ${inviteeResponse.data.user.username}`, 'green');
        } else {
          log('❌ 邀请注册测试失败', 'red');
        }

        // 清理测试用户
        try {
          await axios.delete(`${BASE_URL}/api/users/${inviterResponse.data.user.id}`);
          await axios.delete(`${BASE_URL}/api/users/${inviteeResponse.data.user.id}`);
          log('✅ 邀请测试用户清理完成', 'green');
        } catch (cleanupError) {
          log('⚠️  邀请测试用户清理失败，请手动删除', 'yellow');
        }
      }
    } catch (error) {
      log('❌ 邀请注册测试失败:', error.response?.data || error.message, 'red');
    }

    log('\n🎉 用户 Schema 修复流程完成！', 'green');
    log('=' * 60, 'green');

  } catch (error) {
    log('💥 修复流程中发生错误: ' + error.message, 'red');
  }
}

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 运行修复
if (require.main === module) {
  runUserSchemaFix();
}

module.exports = { runUserSchemaFix }; 