const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 9);

async function fixUserSchema() {
  console.log('🔧 开始修复用户 Schema...');
  console.log('📍 服务器地址: http://118.107.4.158:1337\n');

  try {
    // 1. 检查 Strapi 是否运行
    console.log('1. 检查 Strapi 服务状态...');
    const response = await fetch('http://118.107.4.158:1337/admin');
    if (!response.ok) {
      throw new Error('Strapi 服务未运行');
    }
    console.log('✅ Strapi 服务正常运行');

    // 2. 获取现有用户
    console.log('\n2. 获取现有用户...');
    const usersResponse = await fetch('http://118.107.4.158:1337/api/users');
    const usersData = await usersResponse.json();
    
    if (!usersData.data) {
      console.log('❌ 无法获取用户数据');
      return;
    }

    const users = usersData.data;
    console.log(`✅ 找到 ${users.length} 个用户`);

    // 3. 检查并修复每个用户的字段
    console.log('\n3. 检查并修复用户字段...');
    for (const user of users) {
      const updates = {};
      
      if (!user.attributes.diamondId) {
        updates.diamondId = nanoid();
        console.log(`➕ 为用户 ${user.id} 生成 diamondId: ${updates.diamondId}`);
      }
      
      if (!user.attributes.referralCode) {
        updates.referralCode = nanoid();
        console.log(`➕ 为用户 ${user.id} 生成 referralCode: ${updates.referralCode}`);
      }
      
      if (Object.keys(updates).length > 0) {
        try {
          const updateResponse = await fetch(`http://118.107.4.158:1337/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (updateResponse.ok) {
            console.log(`✅ 用户 ${user.id} 字段更新成功`);
          } else {
            console.log(`❌ 用户 ${user.id} 字段更新失败`);
          }
        } catch (error) {
          console.log(`❌ 用户 ${user.id} 更新异常:`, error.message);
        }
      } else {
        console.log(`✅ 用户 ${user.id} 字段已完整`);
      }
    }

    // 4. 验证修复结果
    console.log('\n4. 验证修复结果...');
    const verifyResponse = await fetch('http://118.107.4.158:1337/api/users');
    const verifyData = await verifyResponse.json();
    
    let completeUsers = 0;
    for (const user of verifyData.data) {
      if (user.attributes.diamondId && user.attributes.referralCode) {
        completeUsers++;
      }
    }
    
    console.log(`✅ 验证完成: ${completeUsers}/${verifyData.data.length} 用户字段完整`);

    console.log('\n🎉 用户 Schema 修复完成！');

  } catch (error) {
    console.error('❌ 修复过程中出错:', error.message);
  }
}

// 运行修复
if (require.main === module) {
  fixUserSchema();
}

module.exports = { fixUserSchema }; 