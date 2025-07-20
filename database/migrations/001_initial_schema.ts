import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 创建认购计划表
  await knex.schema.createTable('subscription_plans', (table) => {
    table.increments('id').primary();
    table.string('code').unique().notNullable();
    table.decimal('principal', 28, 8).notNullable();
    table.integer('cycle').notNullable();
    table.decimal('static_pct', 5, 2).notNullable();
    table.integer('max_buy').notNullable();
    table.string('unlock_after').notNullable();
    table.decimal('referral_pct', 5, 2).notNullable();
    table.decimal('ai_pct', 5, 2).notNullable();
    table.integer('spin_quota').notNullable();
    table.timestamps(true, true);
  });

  // 创建钱包余额表
  await knex.schema.createTable('wallet_balances', (table) => {
    table.increments('id').primary();
    table.decimal('usdt', 28, 8).defaultTo(0).notNullable();
    table.decimal('ai_token', 28, 8).defaultTo(0).notNullable();
    table.integer('spin_quota').defaultTo(0).notNullable();
    table.integer('user_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // 创建钱包交易表
  await knex.schema.createTable('wallet_txes', (table) => {
    table.increments('id').primary();
    table.enum('tx_type', ['deposit', 'withdraw', 'subscription', 'referral', 'aiToken']).notNullable();
    table.enum('direction', ['in', 'out']).notNullable();
    table.decimal('amount', 28, 8).notNullable();
    table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending').notNullable();
    table.json('meta');
    table.integer('user_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // 创建认购订单表
  await knex.schema.createTable('subscription_orders', (table) => {
    table.increments('id').primary();
    table.integer('plan_id').unsigned().references('id').inTable('subscription_plans').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.enum('state', ['active', 'finished']).defaultTo('active').notNullable();
    table.decimal('principal', 28, 8).notNullable();
    table.timestamp('start_at').notNullable();
    table.timestamp('end_at').notNullable();
    table.decimal('static_yield_acc', 28, 8).defaultTo(0).notNullable();
    table.decimal('ai_token_qty', 28, 8).defaultTo(0).notNullable();
    table.integer('spin_quota').defaultTo(0).notNullable();
    table.timestamp('redeemed_at');
    table.timestamps(true, true);
  });

  // 创建推荐奖励表
  await knex.schema.createTable('referral_rewards', (table) => {
    table.increments('id').primary();
    table.integer('referrer_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.integer('from_user_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.integer('from_order_id').unsigned().references('id').inTable('subscription_orders').onDelete('CASCADE');
    table.decimal('amount', 28, 8).notNullable();
    table.timestamps(true, true);
  });

  // 创建 USDT 提现表
  await knex.schema.createTable('usdt_withdraws', (table) => {
    table.increments('id').primary();
    table.decimal('amount', 28, 8).notNullable();
    table.string('to_address').notNullable();
    table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending').notNullable();
    table.string('tx_hash');
    table.integer('user_id').unsigned().references('id').inTable('up_users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // 插入认购计划种子数据
  await knex('subscription_plans').insert([
    {
      code: 'PLAN500',
      principal: 500,
      cycle: 15,
      static_pct: 6.00,
      max_buy: 2,
      unlock_after: '0',
      referral_pct: 100.00,
      ai_pct: 3.00,
      spin_quota: 3,
    },
    {
      code: 'PLAN1K',
      principal: 1000,
      cycle: 20,
      static_pct: 7.00,
      max_buy: 3,
      unlock_after: '完成 PLAN500×2',
      referral_pct: 90.00,
      ai_pct: 4.00,
      spin_quota: 3,
    },
    {
      code: 'PLAN2K',
      principal: 2000,
      cycle: 25,
      static_pct: 8.00,
      max_buy: 4,
      unlock_after: '完成 PLAN1K×3',
      referral_pct: 80.00,
      ai_pct: 5.00,
      spin_quota: 3,
    },
    {
      code: 'PLAN5K',
      principal: 5000,
      cycle: 30,
      static_pct: 10.00,
      max_buy: 5,
      unlock_after: '完成 PLAN2K×4',
      referral_pct: 70.00,
      ai_pct: 6.00,
      spin_quota: 3,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('usdt_withdraws');
  await knex.schema.dropTableIfExists('referral_rewards');
  await knex.schema.dropTableIfExists('subscription_orders');
  await knex.schema.dropTableIfExists('wallet_txes');
  await knex.schema.dropTableIfExists('wallet_balances');
  await knex.schema.dropTableIfExists('subscription_plans');
} 