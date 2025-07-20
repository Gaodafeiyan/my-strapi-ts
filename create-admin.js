const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function createAdmin() {
  console.log('👑 创建管理员账号...\n');
  console.log(`📍 测试服务器: ${BASE_URL}\n`);

  try {
    // 1. 检查是否已有管理员
    console.log('1. 检查现有管理员...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'admin@example.com',
        password: 'Admin123!',
      });
      console.log('✅ 管理员已存在，登录成功');
      return loginResponse.data.data.token;
    } catch (error) {
      console.log('❌ 管理员不存在或密码错误，需要创建');
    }

    // 2. 创建管理员账号
    console.log('\n2. 创建管理员账号...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/admin/register`, {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@example.com',
        password: 'Admin123!',
      });

      console.log('✅ 管理员创建成功:', {
        id: createResponse.data.data.user.id,
        email: createResponse.data.data.user.email
      });

      return createResponse.data.data.token;
    } catch (error) {
      console.log('❌ 管理员创建失败:', error.response?.status, error.response?.data);
      
      // 3. 尝试使用默认管理员
      console.log('\n3. 尝试默认管理员...');
      const defaultAdmins = [
        { email: 'admin@strapi.io', password: 'Admin123!' },
        { email: 'admin@example.com', password: 'admin' },
        { email: 'admin@example.com', password: 'Admin123!' },
        { email: 'admin@example.com', password: 'password' },
      ];

      for (const admin of defaultAdmins) {
        try {
          const loginResponse = await axios.post(`${BASE_URL}/admin/login`, admin);
          console.log('✅ 默认管理员登录成功:', admin.email);
          return loginResponse.data.data.token;
        } catch (error) {
          console.log(`❌ ${admin.email} 登录失败`);
        }
      }

      throw new Error('无法创建或登录管理员账号');
    }

  } catch (error) {
    console.log('❌ 创建管理员失败:', error.message);
    if (error.response?.data) {
      console.log('错误详情:', error.response.data);
    }
    return null;
  }
}

// 运行创建管理员
createAdmin().then(token => {
  if (token) {
    console.log('\n🎉 管理员账号准备完成！');
    console.log('Token:', token.substring(0, 20) + '...');
  } else {
    console.log('\n❌ 管理员账号创建失败');
  }
}); 