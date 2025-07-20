# 投资平台后端 - Strapi v5.18 + TypeScript

## 🚀 项目概述

基于 Strapi v5.18 和 TypeScript 构建的投资平台后端，支持用户邀请注册、认购计划、钱包管理、推荐奖励和提现功能。

## 📋 功能特性

### 里程碑 0 - 基础环境
- ✅ TypeScript 支持
- ✅ SQLite (开发) / PostgreSQL (生产) 数据库配置
- ✅ 保持默认用户角色和权限

### 里程碑 1 - 用户体系 + 邀请码
- ✅ 用户扩展字段 (diamondId, referralCode, invitedBy, invitees)
- ✅ 自动生成唯一 ID 和邀请码
- ✅ 邀请注册接口

### 里程碑 2 - 钱包核心
- ✅ 钱包余额管理 (USDT, AI Token, 抽奖次数)
- ✅ 交易记录追踪
- ✅ 充值地址生成

### 里程碑 3 - 认购计划
- ✅ 4个固定档位计划
- ✅ 公开查询接口

### 里程碑 4 - 认购订单
- ✅ 订单创建和赎回
- ✅ 自动收益计算
- ✅ 定时任务处理

### 里程碑 5 - 邀请返佣
- ✅ 推荐奖励记录
- ✅ 自动奖励分配

### 里程碑 6 - 提现
- ✅ USDT 提现申请
- ✅ 自动处理机制

### 里程碑 7 - 定时任务
- ✅ 订单自动赎回 (每5分钟)
- ✅ 提现自动处理 (每小时)

## 🛠️ 技术栈

- **框架**: Strapi v5.18
- **语言**: TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **计算**: decimal.js (精确数值计算)
- **定时任务**: node-cron
- **测试**: Vitest

## 📦 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 运行数据库迁移
```bash
npm run strapi database:migrate
```

### 4. 运行测试
```bash
npm test
```

## 🔧 配置

### 数据库配置
- 开发环境: SQLite (`.tmp/data.db`)
- 生产环境: PostgreSQL (通过环境变量配置)

### 环境变量
```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

## 📡 API 端点

### 认证相关
- `POST /api/auth/invite-register` - 邀请注册

### 钱包相关
- `GET /api/wallet-balances/my` - 获取我的钱包余额
- `GET /api/wallet-balances/deposit-address` - 获取充值地址

### 认购相关
- `GET /api/subscription-plans` - 获取认购计划 (公开)
- `POST /api/subscription-orders` - 创建认购订单
- `GET /api/subscription-orders/my` - 获取我的订单

### 推荐相关
- `GET /api/referral-rewards/my` - 获取我的推荐奖励

### 提现相关
- `POST /api/usdt-withdraws` - 创建提现申请
- `GET /api/usdt-withdraws/my` - 获取我的提现记录

## 🗄️ 数据模型

### 用户扩展 (User)
- `diamondId` - 钻石ID (10位唯一)
- `referralCode` - 邀请码 (8位唯一)
- `invitedBy` - 邀请人关系
- `invitees` - 被邀请人关系
- `walletBalance` - 钱包余额关系
- `walletTxs` - 钱包交易关系
- `subscriptionOrders` - 认购订单关系
- `referralRewards` - 推荐奖励关系
- `usdtWithdraws` - 提现记录关系

### 认购计划 (Subscription Plan)
- `code` - 计划代码
- `principal` - 本金
- `cycle` - 周期 (天)
- `staticPct` - 静态收益率
- `maxBuy` - 最大购买次数
- `unlockAfter` - 解锁条件
- `referralPct` - 推荐奖励比例
- `aiPct` - AI Token 比例
- `spinQuota` - 抽奖次数

### 钱包余额 (Wallet Balance)
- `usdt` - USDT 余额
- `aiToken` - AI Token 余额
- `spinQuota` - 抽奖次数
- `user` - 用户关系

### 钱包交易 (Wallet Transaction)
- `txType` - 交易类型
- `direction` - 方向 (in/out)
- `amount` - 金额
- `status` - 状态
- `meta` - 元数据
- `user` - 用户关系

### 认购订单 (Subscription Order)
- `plan` - 计划关系
- `user` - 用户关系
- `state` - 状态 (active/finished)
- `principal` - 本金
- `startAt/endAt` - 开始/结束时间
- `staticYieldAcc` - 累计静态收益
- `aiTokenQty` - AI Token 数量
- `spinQuota` - 抽奖次数
- `redeemedAt` - 赎回时间

### 推荐奖励 (Referral Reward)
- `referrer` - 推荐人
- `fromUser` - 下级用户
- `fromOrder` - 来源订单
- `amount` - 奖励金额

### USDT 提现 (USDT Withdraw)
- `amount` - 提现金额
- `toAddress` - 提现地址
- `status` - 状态
- `txHash` - 交易哈希
- `user` - 用户关系

## ⏰ 定时任务

### 订单赎回 (每5分钟)
- 检查过期订单
- 自动计算收益
- 分配 AI Token 和抽奖次数
- 处理推荐奖励

### 提现处理 (每小时)
- 处理待提现申请
- 模拟区块链转账
- 失败时自动退款

## 🔐 权限配置

### 公开接口
- `GET /api/subscription-plans`

### 认证用户接口
- `GET /api/wallet-balances/my`
- `GET /api/wallet-balances/deposit-address`
- `POST /api/subscription-orders`
- `GET /api/subscription-orders/my`
- `GET /api/referral-rewards/my`
- `POST /api/usdt-withdraws`
- `GET /api/usdt-withdraws/my`

### 无需认证接口
- `POST /api/auth/invite-register`

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试覆盖
- API 端点测试
- 数据库模型测试
- 业务逻辑测试

## 📝 开发说明

### 添加新字段
1. 在对应的 `schema.ts` 文件中添加字段定义
2. 运行 `npm run build` 重新构建
3. 重启服务器

### 添加新 API
1. 创建控制器文件
2. 创建路由文件
3. 在后台配置权限

### 数据库迁移
1. 创建迁移文件
2. 运行 `npm run strapi database:migrate`

## 🚀 部署

### 生产环境
1. 设置环境变量
2. 运行数据库迁移
3. 构建项目: `npm run build`
4. 启动服务: `npm start`

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "start"]
```

## 📞 支持

如有问题，请检查：
1. 数据库连接
2. 角色权限配置
3. 定时任务状态
4. 日志输出

---

**投资平台后端 v1.0** - 基于 Strapi v5.18 + TypeScript
