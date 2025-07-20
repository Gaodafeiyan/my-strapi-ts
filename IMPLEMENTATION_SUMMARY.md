# Strapi 投资平台后端实现总结

## 已完成的功能

### 1. 用户生命周期扩展
- ✅ 自动生成 `diamondId` 和 `referralCode`
- ✅ 用户创建后自动初始化钱包余额
- 文件：`src/extensions/users-permissions/content-types/user/lifecycles.ts`

### 2. 邀请注册系统
- ✅ 自定义控制器和路由
- ✅ 邀请码验证
- ✅ 建立邀请关系
- ✅ JWT生成
- 文件：
  - `src/api/auth/controllers/invite-register.ts`
  - `src/api/auth/routes/invite-register.ts`

### 3. Wallet Service
- ✅ 集中管理USDT余额
- ✅ 自动创建交易记录
- ✅ 精确的十进制计算
- 文件：`src/api/wallet-balance/services/wallet-balance.ts`

### 4. 订阅订单系统
- ✅ 购买流程（余额检查、扣款、创建订单）
- ✅ 查询我的订单
- ✅ 手动赎回功能
- ✅ 自动赎回逻辑
- 文件：
  - `src/api/subscription-order/services/subscription-order.ts`
  - `src/api/subscription-order/controllers/subscription-order.ts`
  - `src/api/subscription-order/routes/subscription-order.ts`

### 5. USDT提现系统
- ✅ 提现申请（余额检查、手续费计算）
- ✅ 查询我的提现记录
- ✅ 确认提现功能
- 文件：
  - `src/api/usdt-withdraw/controllers/usdt-withdraw.ts`
  - `src/api/usdt-withdraw/routes/usdt-withdraw.ts`

### 6. 推荐奖励系统
- ✅ 查询我的推荐奖励
- ✅ 自动计算和分配推荐奖励
- 文件：
  - `src/api/referral-reward/controllers/referral-reward.ts`
  - `src/api/referral-reward/routes/referral-reward.ts`

### 7. 定时任务
- ✅ 自动赎回到期订单（每10分钟执行）
- ✅ 推荐奖励自动分配
- 文件：`src/extensions/cron/index.ts`

### 8. 业务枚举和常量
- ✅ 订单状态、交易类型、方向等枚举
- 文件：`src/shared/enums.ts`

### 9. 测试框架
- ✅ Vitest配置
- ✅ 端到端测试用例
- 文件：
  - `vitest.config.ts`
  - `test/e2e.spec.ts`
  - `test/setup.ts`

## API路由汇总

| 路径 | 方法 | 控制器 | 权限 |
|------|------|--------|------|
| `/auth/invite-register` | POST | `invite-register.register` | `public` |
| `/subscription-orders` | POST | `subscription-order.create` | `authenticated` |
| `/subscription-orders/my` | GET | `subscription-order.findMy` | `authenticated` |
| `/subscription-orders/:id/redeem` | POST | `subscription-order.redeemManual` | `authenticated` |
| `/wallet-balances/my` | GET | `wallet-balance.findMine` | `authenticated` |
| `/wallet-balances/deposit-address` | GET | `wallet-balance.getAddr` | `authenticated` |
| `/usdt-withdraws` | POST | `usdt-withdraw.create` | `authenticated` |
| `/usdt-withdraws/my` | GET | `usdt-withdraw.findMine` | `authenticated` |
| `/usdt-withdraws/:id/confirm` | POST | `usdt-withdraw.confirm` | `authenticated` |
| `/referral-rewards/my` | GET | `referral-reward.findMine` | `authenticated` |

## 业务逻辑流程

### 1. 邀请注册流程
1. 用户提供邀请码（可选）
2. 验证邀请码是否存在
3. 创建用户（自动生成diamondId和referralCode）
4. 建立邀请关系
5. 初始化钱包余额
6. 生成JWT返回

### 2. 订阅购买流程
1. 验证计划是否存在
2. 检查用户余额是否足够
3. 扣除用户余额
4. 创建订单（设置到期时间）
5. 记录交易

### 3. 自动赎回流程（定时任务）
1. 查询到期的活跃订单
2. 计算静态收益
3. 给用户添加收益
4. 处理推荐奖励（如果有邀请人）
5. 更新订单状态为已赎回

### 4. 提现流程
1. 检查余额（包含手续费）
2. 扣除余额
3. 创建提现记录
4. 等待链上确认

## 待解决的问题

1. **TypeScript编译错误**：
   - decimal.js模块找不到
   - 共享枚举模块路径问题
   - 某些字段名不匹配

2. **Schema字段缺失**：
   - 用户模型缺少diamondId、referralCode、invitedBy字段
   - 需要在GUI中添加这些字段

3. **测试环境配置**：
   - 需要配置测试数据库
   - 需要设置测试环境变量

## 下一步计划

1. 修复TypeScript编译错误
2. 在GUI中添加缺失的用户字段
3. 配置测试环境
4. 运行端到端测试
5. 部署到生产环境

## 技术栈

- **后端框架**：Strapi v5.18
- **数据库**：SQLite (开发) / PostgreSQL (生产)
- **语言**：TypeScript
- **测试框架**：Vitest
- **数学计算**：decimal.js
- **ID生成**：nanoid
- **定时任务**：Strapi Cron 