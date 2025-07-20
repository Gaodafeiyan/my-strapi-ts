const { Strapi } = require('@strapi/strapi');

async function checkRoles() {
  try {
    const strapi = await Strapi().load();
    
    // 检查默认角色是否存在
    const roles = await strapi.query('plugin::users-permissions.role').findMany();
    console.log('现有角色:', roles.map(r => r.name));
    
    const requiredRoles = ['public', 'authenticated', 'admin'];
    const existingRoleNames = roles.map(r => r.name);
    
    for (const roleName of requiredRoles) {
      if (!existingRoleNames.includes(roleName)) {
        console.log(`❌ 缺少角色: ${roleName}`);
      } else {
        console.log(`✅ 角色存在: ${roleName}`);
      }
    }
    
    // 测试 /users-permissions/roles 端点
    const response = await strapi.request('GET', '/users-permissions/roles');
    console.log('✅ /users-permissions/roles 端点正常，状态码:', response.status);
    
    await strapi.destroy();
    console.log('✅ 角色检查完成');
    
  } catch (error) {
    console.error('❌ 角色检查失败:', error.message);
    process.exit(1);
  }
}

checkRoles(); 