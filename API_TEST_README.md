# Strapi API 测试脚本

这个脚本可以自动测试你的 Strapi 后端所有主要 API 接口。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置登录信息
编辑 `test_all_apis.js` 文件，修改以下配置：
```javascript
const USERNAME = 'your_username'; // 替换为你的用户名
const PASSWORD = 'your_password'; // 替换为你的密码
```

### 3. 运行测试
```bash
npm test
# 或者
node test_all_apis.js
```

## 📋 测试的接口列表

### 用户相关
- `GET /api/users/me` - 获取当前用户信息

### 钱包相关
- `GET /api/wallet-balances/my` - 获取我的钱包余额
- `GET /api/wallet-balances/deposit-address` - 获取充值地址
- `GET /api/wallet-txes` - 获取交易记录
- `GET /api/deposit-addresses` - 获取充值地址列表

### 投资/认购相关
- `GET /api/subscription-plans` - 获取认购计划
- `GET /api/subscription-orders` - 获取认购订单
- `GET /api/investment-orders` - 获取投资订单

### 抽奖相关
- `GET /api/lottery-configs` - 获取抽奖配置
- `GET /api/lottery-prizes` - 获取奖品列表
- `GET /api/lottery-spins` - 获取抽奖记录

### 推荐相关
- `GET /api/referral-rewards` - 获取推荐奖励

### 提现相关
- `GET /api/withdraw-requests` - 获取提现记录

## 🎯 输出说明

- ✅ 绿色：接口调用成功
- ❌ 红色：接口调用失败
- 🔐 蓝色：登录过程
- 👤💰📈🎰👥💸🔍 黄色：不同模块的测试分组

## 🔧 自定义测试

如果你想测试特定的接口，可以修改 `runAllTests()` 函数，添加或删除测试项：

```javascript
// 添加新的测试
await testApi('/api/your-new-endpoint', 'GET', token, null, '你的接口描述');

// 测试 POST 接口
await testApi('/api/your-post-endpoint', 'POST', token, { key: 'value' }, 'POST 接口描述');
```

## 🐛 故障排除

### 1. 登录失败
- 检查用户名和密码是否正确
- 确认 Strapi 服务是否正常运行
- 检查网络连接

### 2. 接口返回 404
- 确认接口路径是否正确
- 检查 Strapi 中是否已创建对应的内容类型
- 确认路由配置是否正确

### 3. 权限错误 (401/403)
- 确认用户已正确登录
- 检查接口的权限配置
- 确认 JWT token 是否有效

## 📝 日志输出

脚本会输出详细的测试结果，包括：
- 每个接口的调用状态
- 返回的数据内容
- 错误信息（如果有）

你可以将输出保存到文件：
```bash
node test_all_apis.js > test_results.log
``` 