export default {
  async register(ctx) {
    const { email, password, username, inviteCode } = ctx.request.body;

    // 校验邀请码是否存在
    if (inviteCode) {
      const inviter = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { referralCode: inviteCode } as any,
        fields: ['id', 'referralCode'] as any
      });

      if (!inviter || inviter.length === 0) {
        return ctx.badRequest('Invalid invite code');
      }
    }

    // 获取authenticated角色ID
    const authenticatedRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
      filters: { name: 'authenticated' }
    });

    if (!authenticatedRole || authenticatedRole.length === 0) {
      return ctx.badRequest('Authenticated role not found');
    }

    // 创建用户
    const userData = {
      email,
      password,
      username,
      confirmed: true,
      blocked: false,
      role: authenticatedRole[0].id, // 使用正确的角色ID
    };

    try {
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: userData,
      });

      // 建立邀请关系
      if (inviteCode) {
        const inviter = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { referralCode: inviteCode } as any,
          fields: ['id'] as any
        });

        if (inviter && inviter.length > 0) {
          await strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: { invitedBy: inviter[0].id } as any
          });
        }
      }

      // 生成 JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      return {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          diamondId: (user as any).diamondId,
          referralCode: (user as any).referralCode,
          role: 'authenticated', // 直接返回角色名称
        }
      };
    } catch (error) {
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  }
}; 