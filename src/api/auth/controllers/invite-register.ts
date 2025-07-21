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
      // 尝试创建默认角色
      try {
        const defaultRole = await strapi.entityService.create('plugin::users-permissions.role', {
          data: {
            name: 'authenticated',
            description: 'Default role given to authenticated user.',
            type: 'authenticated',
            permissions: {} as any
          }
        });
        
        // 重新获取角色
        const newRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { name: 'authenticated' }
        });
        
        if (!newRole || newRole.length === 0) {
          return ctx.badRequest('Failed to create authenticated role');
        }
      } catch (error) {
        console.log('❌ 创建角色失败:', error.message);
        return ctx.badRequest('Authenticated role not found and failed to create');
      }
    }

    // 重新获取角色ID
    const role = await strapi.entityService.findMany('plugin::users-permissions.role', {
      filters: { name: 'authenticated' }
    });

    if (!role || role.length === 0) {
      return ctx.badRequest('Authenticated role not found');
    }

    // 创建用户
    const userData = {
      email,
      password,
      username,
      confirmed: true,
      blocked: false,
      role: role[0].id,
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

      // 重新获取用户数据以确保包含新字段
      const updatedUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['role']
      }) as any;

      return {
        jwt,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          diamondId: updatedUser.diamondId,
          referralCode: updatedUser.referralCode,
          invitedBy: updatedUser.invitedBy,
          role: 'authenticated',
        }
      };
    } catch (error) {
      console.log('❌ 用户创建失败:', error.message);
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  },

  // 获取我的邀请码
  async getMyInviteCode(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        fields: ['id', 'username', 'referralCode', 'diamondId'] as any
      }) as any;

      if (!user) {
        return ctx.notFound('User not found');
      }

      return {
        referralCode: user.referralCode,
        diamondId: user.diamondId,
        username: user.username,
        inviteUrl: `https://yourdomain.com/register?code=${user.referralCode}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user.referralCode}`
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 获取邀请统计
  async getInviteStats(ctx) {
    const userId = ctx.state.user.id;
    
    try {
      // 获取被邀请的用户数量
      const invitedUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { invitedBy: userId } as any,
        fields: ['id', 'username', 'createdAt']
      });

      // 获取推荐奖励总额
      const referralRewards = await strapi.entityService.findMany('api::referral-reward.referral-reward', {
        filters: { referrer: userId } as any,
        fields: ['amountUSDT', 'createdAt']
      });

      const totalRewards = referralRewards.reduce((sum, reward) => sum + reward.amountUSDT, 0);
      const todayRewards = referralRewards
        .filter(reward => {
          const today = new Date();
          const rewardDate = new Date(reward.createdAt);
          return rewardDate.toDateString() === today.toDateString();
        })
        .reduce((sum, reward) => sum + reward.amountUSDT, 0);

      return {
        totalInvites: invitedUsers.length,
        totalRewards: totalRewards,
        todayRewards: todayRewards,
        invitedUsers: invitedUsers.map(user => ({
          id: user.id,
          username: user.username,
          joinDate: user.createdAt
        }))
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // 获取邀请人列表
  async getInvitedUsers(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 10 } = ctx.query;
    
    try {
      const invitedUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { invitedBy: userId } as any,
        fields: ['id', 'username', 'createdAt', 'diamondId'] as any,
        sort: { createdAt: 'desc' },
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });

      return invitedUsers;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}; 