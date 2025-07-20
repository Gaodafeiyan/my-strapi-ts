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
    console.log('🔍 查找authenticated角色...');
    const authenticatedRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
      filters: { name: 'authenticated' }
    });

    console.log('🔍 找到的角色:', authenticatedRole);

    if (!authenticatedRole || authenticatedRole.length === 0) {
      console.log('❌ 未找到authenticated角色，尝试创建...');
      
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
        console.log('✅ 创建了默认authenticated角色:', defaultRole.id);
        
        // 重新获取角色
        const newRole = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { name: 'authenticated' }
        });
        
        if (newRole && newRole.length > 0) {
          console.log('✅ 找到新创建的authenticated角色:', newRole[0].id);
        } else {
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

    console.log('✅ 使用角色ID:', role[0].id);

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

      console.log('✅ 用户创建成功:', user.id);

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
          role: 'authenticated',
        }
      };
    } catch (error) {
      console.log('❌ 用户创建失败:', error.message);
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  }
}; 