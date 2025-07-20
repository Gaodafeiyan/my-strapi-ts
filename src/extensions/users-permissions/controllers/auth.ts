import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async inviteRegister(ctx) {
    const { username, email, password, inviteCode } = ctx.request.body;

    // 验证必填字段
    if (!username || !email || !password || !inviteCode) {
      return ctx.badRequest('缺少必填字段');
    }

    try {
      // 验证邀请码是否存在
      const inviter = await strapi.query('plugin::users-permissions.user').findOne({
        where: { referralCode: inviteCode }
      });

      if (!inviter) {
        return ctx.badRequest('邀请码无效');
      }

      // 检查用户是否已存在
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return ctx.badRequest('用户名或邮箱已存在');
      }

      // 创建新用户
      const userData = {
        username,
        email,
        password,
        confirmed: true,
        invitedBy: inviter.id,
        role: 1, // authenticated role
      };

      const user = await strapi.query('plugin::users-permissions.user').create({
        data: userData
      });

      // 生成 JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });

      // 返回用户信息（不包含密码）
      const sanitizedUser = await strapi.plugin('users-permissions').service('user').sanitizeUser(user);

      return {
        jwt,
        user: sanitizedUser,
      };

    } catch (error) {
      strapi.log.error('邀请注册失败:', error);
      return ctx.internalServerError('注册失败');
    }
  },
})); 