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

    // 创建用户（会触发生命周期）
    const userData = {
      email,
      password,
      username,
      confirmed: true,
      blocked: false,
      role: 1, // authenticated role
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
        }
      };
    } catch (error) {
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  }
}; 