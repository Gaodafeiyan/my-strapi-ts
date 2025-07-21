import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  
  // 邀请注册
  async inviteRegister(ctx) {
    try {
      const { username, email, password, yaoqingMa } = ctx.request.body;
      
      // 验证邀请码
      const inviter = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { yaoqingMa }
      });
      
      if (!inviter) {
        throw new Error('邀请码无效');
      }
      
      // 创建用户
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username,
          email,
          password,
          shangji: inviter.id,
          confirmed: true,
          blocked: false,
          role: 1 // 默认用户角色
        }
      });
      
      // 生成JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id
      });
      
      ctx.body = {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            yaoqingMa: user.yaoqingMa
          },
          jwt
        },
        message: '注册成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  },
  
  // 验证邀请码
  async verifyInviteCode(ctx) {
    try {
      const { yaoqingMa } = ctx.params;
      
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { yaoqingMa }
      });
      
      if (!user) {
        throw new Error('邀请码无效');
      }
      
      ctx.body = {
        success: true,
        data: {
          inviter: {
            username: user.username,
            yaoqingMa: user.yaoqingMa
          }
        },
        message: '邀请码有效'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message
      };
      ctx.status = 400;
    }
  }
})); 