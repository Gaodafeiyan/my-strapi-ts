export default ({ strapi }) => {
  strapi.log.info('🚀 投资平台后端启动中...');

  // 检查默认角色是否存在
  strapi.db.query('plugin::users-permissions.role').findMany().then((roles) => {
    const roleNames = roles.map(r => r.name);
    strapi.log.info('现有角色:', roleNames);
    
    const requiredRoles = ['public', 'authenticated', 'admin'];
    for (const roleName of requiredRoles) {
      if (!roleNames.includes(roleName)) {
        strapi.log.warn(`⚠️  缺少角色: ${roleName}`);
      } else {
        strapi.log.info(`✅ 角色存在: ${roleName}`);
      }
    }
  });

  // 检查认购计划是否存在
  strapi.db.query('api::subscription-plan.subscription-plan').findMany().then((plans) => {
    if (plans.length === 0) {
      strapi.log.warn('⚠️  认购计划为空，请运行数据库迁移');
    } else {
      strapi.log.info(`✅ 认购计划已加载: ${plans.length} 个`);
    }
  });

  strapi.log.info('✅ 投资平台后端启动完成');
}; 