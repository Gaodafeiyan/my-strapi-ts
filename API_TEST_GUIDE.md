# 投资平台API测试指南

## 🚀 服务器信息
- **地址**: http://118.107.4.158:1337
- **管理后台**: http://118.107.4.158:1337/admin
- **API文档**: http://118.107.4.158:1337/documentation

## 📋 测试步骤

### 1. 检查服务器状态
```bash
# 检查服务器是否运行
curl -I http://118.107.4.158:1337/admin

# 检查API文档
curl http://118.107.4.158:1337/documentation
```

### 2. 邀请注册测试
```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### 3. 使用JWT测试其他API
```bash
# 替换 YOUR_JWT_TOKEN 为注册返回的JWT
JWT="YOUR_JWT_TOKEN"

# 查询钱包余额
curl -X GET http://118.107.4.158:1337/api/wallet-balances/my \
  -H "Authorization: Bearer $JWT"

# 查询充值地址
curl -X GET http://118.107.4.158:1337/api/wallet-balances/deposit-address \
  -H "Authorization: Bearer $JWT"

# 查询我的订单
curl -X GET http://118.107.4.158:1337/api/subscription-orders/my \
  -H "Authorization: Bearer $JWT"

# 查询推荐奖励
curl -X GET http://118.107.4.158:1337/api/referral-rewards/my \
  -H "Authorization: Bearer $JWT"

# 查询提现记录
curl -X GET http://118.107.4.158:1337/api/usdt-withdraws/my \
  -H "Authorization: Bearer $JWT"
```

## 🔧 完整业务流程测试

### 步骤1: 注册用户A（无邀请码）
```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userA@example.com",
    "password": "password123",
    "username": "userA"
  }'
```

### 步骤2: 注册用户B（使用A的邀请码）
```bash
# 从步骤1的响应中获取userA的referralCode
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userB@example.com",
    "password": "password123",
    "username": "userB",
    "inviteCode": "USER_A_REFERRAL_CODE"
  }'
```

### 步骤3: 购买订阅计划
```bash
curl -X POST http://118.107.4.158:1337/api/subscription-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_B_JWT" \
  -d '{
    "planCode": "PLAN500"
  }'
```

### 步骤4: 申请提现
```bash
curl -X POST http://118.107.4.158:1337/api/usdt-withdraws \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT" \
  -d '{
    "amount": 100,
    "address": "TRC20_ADDRESS_HERE",
    "network": "TRC20"
  }'
```

## 📊 预期响应格式

### 注册成功响应
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "ABC123456",
    "referralCode": "XYZ789012"
  }
}
```

### 钱包余额响应
```json
{
  "id": 1,
  "usdtBalance": 0,
  "aiTokenBalance": 0,
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

### 充值地址响应
```json
{
  "address": "TRC20_USDT_ADDRESS_HERE",
  "network": "TRC20",
  "memo": "User_1"
}
```

## ⚠️ 注意事项

1. **JWT Token**: 注册成功后需要保存JWT token用于后续API调用
2. **余额检查**: 购买订阅前需要确保用户有足够余额
3. **邀请码**: 邀请码必须是有效的referralCode
4. **权限**: 大部分API需要认证用户才能访问

## 🐛 常见问题

### 1. 401 Unauthorized
- 检查JWT token是否正确
- 确保token没有过期

### 2. 400 Bad Request
- 检查请求体格式是否正确
- 验证必填字段是否完整

### 3. 404 Not Found
- 检查API路径是否正确
- 确认服务器正在运行

## 📞 联系信息

如果遇到问题，请检查：
1. 服务器是否正常运行
2. 网络连接是否正常
3. API路径是否正确
4. 请求格式是否符合要求 