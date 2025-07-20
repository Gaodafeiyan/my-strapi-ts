module.exports = async ({ strapi }) => {
  const roles = await strapi
    .query('plugin::users-permissions.role')
    .findMany({ select: ['type'] });

  if (!roles.find(r => r.type === 'authenticated')) {
    await strapi
      .query('plugin::users-permissions.role')
      .create({
        data: {
          name: 'Authenticated',
          type: 'authenticated',
          permissions: {}, // 先空，GUI 勾选
        },
      });
  }

  if (!roles.find(r => r.type === 'public')) {
    await strapi
      .query('plugin::users-permissions.role')
      .create({
        data: {
          name: 'Public',
          type: 'public',
          permissions: {}, // 先空，GUI 勾选
        },
      });
  }

  if (!roles.find(r => r.type === 'admin')) {
    await strapi
      .query('plugin::users-permissions.role')
      .create({
        data: {
          name: 'Admin',
          type: 'admin',
          permissions: {}, // 先空，GUI 勾选
        },
      });
  }

  console.log('✅ 角色种子数据已创建');
}; 