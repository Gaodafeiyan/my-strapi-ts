# 🏗️ Strapi 5.18 + TypeScript 后端骨架总结

## 📁 项目结构

```
src/
├── api/
│   ├── dinggou-dingdan/          # 认购订单
│   │   ├── content-types/
│   │   │   └── dinggou-dingdan/
│   │   │       └── schema.json
│   │   ├── controllers/
│   │   │   └── dinggou-dingdan.ts
│   │   ├── routes/
│   │   │   └── dinggou-dingdan.ts
│   │   └── services/
│   │       └── dinggou-dingdan.ts
│   ├── dinggou-jihua/            # 认购计划
│   │   └── content-types/
│   │       └── dinggou-jihua/
│   │           └── schema.json
│   ├── qianbao-yue/              # 钱包余额
│   │   ├── content-types/
│   │   │   └── qianbao-yue/
│   │   │       └── schema.json
│   │   ├── controllers/
│   │   │   └── qianbao-yue.ts
│   │   ├── routes/
│   │   │   └── qianbao-yue.ts
│   │   └── services/
│   │       └── qianbao-yue.ts
│   ├── yaoqing-jiangli/          # 邀请奖励
│   │   ├── content-types/
│   │   │   └── yaoqing-jiangli/
│   │   │       └── schema.json
│   │   └── services/
│   │       └── yaoqing-jiangli.ts
│   └── auth/                     # 认证相关
│       ├── controllers/
│       │   └── invite-register.ts
│       └── routes/
│           └── invite-register.ts
├── extensions/
│   └── users-permissions/
│       └── content-types/
│           └── user/
│               ├── schema.json
│               └── lifecycles.ts
└── functions/
    └── checkDingdanExpire.ts
```

## 🗄️ Content Types 设计

### 1. 用户扩展 (users-permissions.user)
- `yaoqingMa`: 邀请码 (9位唯一)
- `shangji`: 上级用户关系
- `xiaji`: 下级用户列表
- `qianbao`: 钱包余额关联
- `dinggouOrders`: 认购订单列表

### 2. 钱包余额 (qianbao-yue)
- `usdtYue`: USDT余额
- `aiYue`: AI代币余额
- `yonghu`: 用户关联

### 3. 认购计划 (dinggou-jihua)
- `jihuaCode`: 计划代码 (PLAN500等)
- `benjinUSDT`: 本金金额
- `zhouQiTian`: 周期天数
- `jingtaiBili`: 静态收益比例
- `aiBili`: AI代币比例
- `choujiangCi`: 抽奖次数
- `kaiqi`: 是否开启

### 4. 认购订单 (dinggou-dingdan)
- `benjinUSDT`: 本金金额
- `zhuangtai`: 订单状态 (active/finished)
- `kaishiShiJian`: 开始时间
- `jieshuShiJian`: 结束时间
- `jingtaiShouyi`: 静态收益
- `aiShuliang`: AI代币数量
- `yonghu`: 用户关联
- `jihua`: 计划关联
- `jiangli`: 推荐奖励关联

### 5. 邀请奖励 (yaoqing-jiangli)
- `shouyiUSDT`: 奖励USDT
- `tuijianRen`: 推荐人
- `laiyuanRen`: 来源人
- `laiyuanDan`: 来源订单

## 🔧 核心 Service 功能

### 钱包余额 Service
- `add(userId, amount)`: 增加USDT余额
- `deduct(userId, amount)`: 扣除USDT余额
- `addAi(userId, amount)`: 增加AI代币
- `getUserWallet(userId)`: 获取用户钱包

### 认购订单 Service
- `createWithChecks(userId, jihuaId)`: 创建订单（扣款+写单）
- `redeem(orderId)`: 赎回订单（收益+奖励）

### 邀请奖励 Service
- `createReward(inviterId, dingdan)`: 创建推荐奖励

## 🛣️ API 路由

### 认购相关
- `POST /dinggou-dingdans/create` - 创建认购订单
- `POST /dinggou-dingdans/:id/redeem` - 赎回订单
- `GET /dinggou-dingdans/my-orders` - 我的订单列表

### 钱包相关
- `GET /qianbao-yues/my-wallet` - 我的钱包余额
- `POST /qianbao-yues/recharge` - 充值USDT（管理员）

### 认证相关
- `POST /auth/invite-register` - 邀请注册
- `GET /auth/verify-invite/:yaoqingMa` - 验证邀请码

## ⏰ 定时任务

### checkDingdanExpire
- 检查过期订单
- 自动赎回处理
- 发放推荐奖励

## 🔄 业务流程

### 1. 用户注册流程
1. 用户提供邀请码注册
2. 系统验证邀请码有效性
3. 创建用户账户和钱包
4. 建立推荐关系
5. 生成专属邀请码

### 2. 认购投资流程
1. 用户选择认购计划
2. 系统检查钱包余额
3. 扣除USDT本金
4. 创建认购订单
5. 设置到期时间

### 3. 订单赎回流程
1. 检查订单是否到期
2. 计算静态收益
3. 发放USDT收益和本金
4. 发放AI代币奖励
5. 计算并发放推荐奖励
6. 更新订单状态

### 4. 推荐奖励计算
- 基于推荐人最高投资档位
- 档位对应不同奖励比例
- 支持多级推荐关系

## 🎯 下一步开发计划

### 1. 完善功能
- [ ] 抽奖系统实现
- [ ] 提现功能
- [ ] 充值功能
- [ ] 管理后台页面

### 2. 优化功能
- [ ] 数据库索引优化
- [ ] 缓存机制
- [ ] 错误处理完善
- [ ] 日志记录

### 3. 安全功能
- [ ] 接口权限控制
- [ ] 数据验证
- [ ] 防刷机制
- [ ] 审计日志

## 🚀 启动项目

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn develop

# 构建生产版本
yarn build

# 启动生产服务器
yarn start
```

## 📝 注意事项

1. **字段命名**: 统一使用拼音+驼峰命名
2. **权限控制**: 所有接口都需要适当的权限验证
3. **数据精度**: 使用decimal类型处理金额计算
4. **关系管理**: 注意外键关系的正确性
5. **错误处理**: 完善的错误处理和用户提示

---

🎉 **后端骨架搭建完成！** 现在可以运行 `yarn develop` 启动项目，在Strapi管理后台查看所有拼音命名的字段和功能。 