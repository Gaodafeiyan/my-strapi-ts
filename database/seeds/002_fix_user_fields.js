const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 9);

module.exports = {
  async up(knex) {
    console.log('🔧 开始修复用户字段...');

    try {
      // 检查用户表是否存在
      const tableExists = await knex.schema.hasTable('up_users');
      if (!tableExists) {
        console.log('❌ 用户表不存在，跳过修复');
        return;
      }

      // 检查字段是否已存在
      const hasDiamondId = await knex.schema.hasColumn('up_users', 'diamondId');
      const hasReferralCode = await knex.schema.hasColumn('up_users', 'referralCode');
      const hasInvitedBy = await knex.schema.hasColumn('up_users', 'invitedBy');

      // 添加缺失的字段
      if (!hasDiamondId) {
        console.log('➕ 添加 diamondId 字段...');
        await knex.schema.alterTable('up_users', (table) => {
          table.string('diamondId', 9).unique();
        });
      }

      if (!hasReferralCode) {
        console.log('➕ 添加 referralCode 字段...');
        await knex.schema.alterTable('up_users', (table) => {
          table.string('referralCode', 9).unique();
        });
      }

      if (!hasInvitedBy) {
        console.log('➕ 添加 invitedBy 字段...');
        await knex.schema.alterTable('up_users', (table) => {
          table.integer('invitedBy').unsigned();
          table.foreign('invitedBy').references('id').inTable('up_users');
        });
      }

      // 为现有用户生成缺失的字段值
      const users = await knex('up_users').select('id', 'diamondId', 'referralCode');
      
      for (const user of users) {
        const updates = {};
        
        if (!user.diamondId) {
          updates.diamondId = nanoid();
        }
        
        if (!user.referralCode) {
          updates.referralCode = nanoid();
        }
        
        if (Object.keys(updates).length > 0) {
          await knex('up_users')
            .where('id', user.id)
            .update(updates);
          
          console.log(`✅ 更新用户 ${user.id} 的字段:`, updates);
        }
      }

      // 将字段设置为必填
      console.log('🔒 设置字段为必填...');
      await knex.schema.alterTable('up_users', (table) => {
        table.string('diamondId', 9).notNullable().alter();
        table.string('referralCode', 9).notNullable().alter();
      });

      console.log('✅ 用户字段修复完成！');

    } catch (error) {
      console.error('❌ 修复用户字段时出错:', error.message);
      throw error;
    }
  },

  async down(knex) {
    console.log('🔄 回滚用户字段修复...');

    try {
      // 移除字段
      await knex.schema.alterTable('up_users', (table) => {
        table.dropColumn('diamondId');
        table.dropColumn('referralCode');
        table.dropColumn('invitedBy');
      });

      console.log('✅ 用户字段回滚完成！');
    } catch (error) {
      console.error('❌ 回滚用户字段时出错:', error.message);
      throw error;
    }
  }
}; 