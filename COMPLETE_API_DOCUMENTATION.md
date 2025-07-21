# 完整API文档

## 🚀 服务器信息
- **地址**: http://118.107.4.158:1337
- **管理后台**: http://118.107.4.158:1337/admin
- **API文档**: http://118.107.4.158:1337/documentation

## 📋 API接口清单

### 🔐 认证相关

#### 1. 邀请注册
```http
POST /api/auth/invite-register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "inviteCode": "ABC123456" // 可选
}
```

**响应示例：**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "ABC123456",
    "referralCode": "XYZ789012",
    "invitedBy": 2,
    "role": "authenticated"
  }
}
```

#### 2. 获取我的邀请码
```http
GET /api/auth/my-invite-code
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
{
  "referralCode": "ABC123456",
  "diamondId": "DEF789012",
  "username": "testuser",
  "inviteUrl": "https://yourdomain.com/register?code=ABC123456",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABC123456"
}
```

#### 3. 获取邀请统计
```http
GET /api/auth/invite-stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
{
  "totalInvites": 5,
  "totalRewards": 150,
  "todayRewards": 30,
  "invitedUsers": [
    {
      "id": 2,
      "username": "user2",
      "joinDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 4. 获取邀请人列表
```http
GET /api/auth/invited-users?page=1&pageSize=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
[
  {
    "id": 2,
    "username": "user2",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "diamondId": "DEF789012"
  }
]
```

### 💰 钱包相关

#### 5. 获取钱包余额
```http
GET /api/wallet-balances/my
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
{
  "id": 1,
  "usdtBalance": 500,
  "aiTokenBalance": 100,
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

#### 6. 获取充值地址
```http
GET /api/wallet-balances/deposit-address
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
{
  "address": "TRC20_USDT_ADDRESS_HERE",
  "network": "TRC20",
  "memo": "User_1"
}
```

### 📈 订阅相关

#### 7. 获取订阅计划
```http
GET /api/subscription-plans
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
[
  {
    "id": 1,
    "planCode": "PLAN500",
    "principalUSDT": 500,
    "cycle_days": 30,
    "staticPct": 6.0,
    "tokenBonusPct": 2.0,
    "enabled": true
  }
]
```

#### 8. 创建订阅订单
```http
POST /api/subscription-orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "planCode": "PLAN500"
}
```

**响应示例：**
```json
{
  "id": 1,
  "user": 1,
  "plan": 1,
  "principalUSDT": 500,
  "state": "active",
  "startAt": "2024-01-15T10:30:00.000Z",
  "endAt": "2024-02-14T10:30:00.000Z"
}
```

#### 9. 获取我的订单
```http
GET /api/subscription-orders/my
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 10. 手动赎回订单
```http
POST /api/subscription-orders/:id/redeem
Authorization: Bearer YOUR_JWT_TOKEN
```

### 🎰 抽奖相关

#### 11. 获取抽奖配置
```http
GET /api/lottery-configs
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 12. 获取奖品列表
```http
GET /api/lottery-prizes
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 13. 执行抽奖
```http
POST /api/lottery-spins
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 14. 获取抽奖记录
```http
GET /api/lottery-spins
Authorization: Bearer YOUR_JWT_TOKEN
```

### 💸 提现相关

#### 15. 申请提现
```http
POST /api/usdt-withdraws
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 100,
  "address": "TRC20_ADDRESS_HERE",
  "network": "TRC20"
}
```

#### 16. 获取提现记录
```http
GET /api/usdt-withdraws/my
Authorization: Bearer YOUR_JWT_TOKEN
```

### 🎁 推荐奖励相关

#### 17. 获取推荐奖励
```http
GET /api/referral-rewards/my
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例：**
```json
[
  {
    "id": 1,
    "referrer": 1,
    "fromUser": 2,
    "amountUSDT": 30,
    "description": "Referral reward from user2 (PLAN500)",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## 🔄 完整业务流程示例

### 邀请注册流程

1. **用户A注册（无邀请码）**
```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "email": "usera@example.com",
    "password": "password123"
  }'
```

2. **用户B使用A的邀请码注册**
```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "email": "userb@example.com",
    "password": "password123",
    "inviteCode": "USER_A_REFERRAL_CODE"
  }'
```

3. **用户A获取邀请统计**
```bash
curl -X GET http://118.107.4.158:1337/api/auth/invite-stats \
  -H "Authorization: Bearer USER_A_JWT"
```

4. **用户B购买订阅计划**
```bash
curl -X POST http://118.107.4.158:1337/api/subscription-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_B_JWT" \
  -d '{
    "planCode": "PLAN500"
  }'
```

5. **订单到期后，用户A自动获得推荐奖励**

## 📊 推荐奖励规则

### 核心原则
邀请人只能按照**自己已投资的最高档位**来获得推荐奖励，而不是按照被邀请人的投资档位。

### 奖励比例表

| 邀请人投资档位 | 推荐奖励比例 | 说明 |
|---------------|-------------|------|
| PLAN500 (500U) | 100% | 只能按500U档位获得奖励 |
| PLAN1K (1000U) | 90% | 只能按1000U档位获得奖励 |
| PLAN2K (2000U) | 80% | 只能按2000U档位获得奖励 |
| PLAN5K (5000U) | 70% | 可以按所有档位获得奖励 |

### 计算示例

**场景1：邀请人投资500U，被邀请人投资1000U**
- 被邀请人静态收益：1000 × 6% = 60 USDT
- 邀请人获得奖励：60 × 100% = 60 USDT

**场景2：邀请人投资1000U，被邀请人投资500U**
- 被邀请人静态收益：500 × 6% = 30 USDT
- 邀请人获得奖励：30 × 90% = 27 USDT

**场景3：邀请人投资5000U，被邀请人投资2000U**
- 被邀请人静态收益：2000 × 6% = 120 USDT
- 邀请人获得奖励：120 × 70% = 84 USDT

### 重要说明
- 邀请人必须有自己的投资记录才能获得推荐奖励
- 系统会自动查找邀请人的最高投资档位
- 只计算活跃和已赎回的订单作为投资记录

## ⚠️ 注意事项

1. **JWT Token**: 大部分API需要JWT认证
2. **邀请码**: 必须是有效的referralCode
3. **余额检查**: 购买订阅前确保有足够余额
4. **整数计算**: 所有金额都使用整数计算，避免浮点数精度问题

## 🐛 常见错误码

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或JWT无效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 📞 技术支持

如有问题，请检查：
1. 服务器状态
2. 网络连接
3. JWT Token有效性
4. 请求参数格式 