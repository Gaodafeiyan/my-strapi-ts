# 邀请奖励（动态收益）统一公式制度详细说明

## 🎯 制度核心

邀请奖励统一公式制度的核心原则是：
1. **统一公式**：推荐奖励 = min(被邀请人本金, 邀请人本金) × 邀请人静态收益率 × 邀请人返佣比例
2. **只看邀请人档位**：收益率与返佣比例都取自邀请人自身；被邀请人档位只影响"min"那一步
3. **本金上限**：始终取邀请人本金与被邀请人本金的较小值
4. **超额部分不计**：当被邀请人本金高于邀请人本金，超过部分不产生推荐奖励

## 📊 邀请人档位收益率与返佣比例表

| 邀请人投资档位 | 投资金额 | 静态收益率 | 返佣比例 | 说明 |
|---------------|---------|-----------|---------|------|
| PLAN500 | 500 USDT | 6% | 100% | 最低档位 |
| PLAN1K | 1000 USDT | 7% | 90% | 第二档位 |
| PLAN2K | 2000 USDT | 8% | 80% | 第三档位 |
| PLAN5K | 5000 USDT | 10% | 70% | 最高档位 |

## 🔄 计算逻辑

### 1. 确定邀请人最高档位
- 系统查询邀请人的所有活跃和已赎回订单
- 按投资金额降序排列，取最高档位
- 如果邀请人没有投资记录，不获得奖励

### 2. 获取邀请人档位参数
```
根据邀请人档位确定：
- 邀请人静态收益率
- 邀请人返佣比例
```

### 3. 推荐奖励计算（统一公式）
```
推荐奖励 = min(被邀请人本金, 邀请人本金) × 邀请人静态收益率 × 邀请人返佣比例
```

## 📝 详细示例

### 示例1：邀请人投资500U

**投资情况：**
- 邀请人：投资500U（PLAN500档位，静态收益率6%，返佣比例100%）

**计算过程：**
1. 被邀请人投资500U：min(500, 500) × 6% × 100% = 500 × 6% × 100% = 30 USDT
2. 被邀请人投资1000U：min(1000, 500) × 6% × 100% = 500 × 6% × 100% = 30 USDT
3. 被邀请人投资5000U：min(5000, 500) × 6% × 100% = 500 × 6% × 100% = 30 USDT

**结果：** 邀请人获得30 USDT推荐奖励（所有情况都是30U）

### 示例2：邀请人投资1000U

**投资情况：**
- 邀请人：投资1000U（PLAN1K档位，静态收益率7%，返佣比例90%）

**计算过程：**
1. 被邀请人投资500U：min(500, 1000) × 7% × 90% = 500 × 7% × 90% = 31.5 USDT（≈ 32 USDT）
2. 被邀请人投资1000U：min(1000, 1000) × 7% × 90% = 1000 × 7% × 90% = 63 USDT
3. 被邀请人投资2000U：min(2000, 1000) × 7% × 90% = 1000 × 7% × 90% = 63 USDT
4. 被邀请人投资5000U：min(5000, 1000) × 7% × 90% = 1000 × 7% × 90% = 63 USDT

**结果：** 邀请人根据被邀请人投资金额获得32-63 USDT推荐奖励

### 示例3：邀请人投资2000U

**投资情况：**
- 邀请人：投资2000U（PLAN2K档位，静态收益率8%，返佣比例80%）

**计算过程：**
1. 被邀请人投资500U：min(500, 2000) × 8% × 80% = 500 × 8% × 80% = 32 USDT
2. 被邀请人投资1000U：min(1000, 2000) × 8% × 80% = 1000 × 8% × 80% = 64 USDT
3. 被邀请人投资2000U：min(2000, 2000) × 8% × 80% = 2000 × 8% × 80% = 128 USDT
4. 被邀请人投资5000U：min(5000, 2000) × 8% × 80% = 2000 × 8% × 80% = 128 USDT

**结果：** 邀请人根据被邀请人投资金额获得32-128 USDT推荐奖励

### 示例4：邀请人投资5000U

**投资情况：**
- 邀请人：投资5000U（PLAN5K档位，静态收益率10%，返佣比例70%）

**计算过程：**
1. 被邀请人投资500U：min(500, 5000) × 10% × 70% = 500 × 10% × 70% = 35 USDT
2. 被邀请人投资1000U：min(1000, 5000) × 10% × 70% = 1000 × 10% × 70% = 70 USDT
3. 被邀请人投资2000U：min(2000, 5000) × 10% × 70% = 2000 × 10% × 70% = 140 USDT
4. 被邀请人投资5000U：min(5000, 5000) × 10% × 70% = 5000 × 10% × 70% = 350 USDT

**结果：** 邀请人根据被邀请人投资金额获得35-350 USDT推荐奖励

## ⚙️ 技术实现

### 1. 推荐奖励计算函数
```javascript
async function calculateReferralRewardByInviterLevel(inviterId, inviteePrincipal, inviteeStaticProfit, inviteePlanCode) {
  // 1) 查邀请人最高档位
  const inviterOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order', {
    filters: { user: inviterId, state: { $in: ['active', 'redeemed'] } },
    populate: ['plan'],
    sort: { principalUSDT: 'desc' },
    limit: 1
  });

  if (!inviterOrders || inviterOrders.length === 0) {
    return 0; // 邀请人没有投资记录，不获得奖励
  }

  const inviterOrder = inviterOrders[0];
  const inviterPlanCode = inviterOrder.plan.planCode;
  const inviterPrincipal = inviterOrder.principalUSDT;

  // 2) 根据邀请人档位确定收益率和返佣比例
  let inviterStaticRate = 0;
  let inviterReferralRate = 0;
  
  switch (inviterPlanCode) {
    case 'PLAN500':
      inviterStaticRate = 0.06; // 6%
      inviterReferralRate = 1.0; // 100%
      break;
    case 'PLAN1K':
      inviterStaticRate = 0.07; // 7%
      inviterReferralRate = 0.9; // 90%
      break;
    case 'PLAN2K':
      inviterStaticRate = 0.08; // 8%
      inviterReferralRate = 0.8; // 80%
      break;
    case 'PLAN5K':
      inviterStaticRate = 0.10; // 10%
      inviterReferralRate = 0.7; // 70%
      break;
    default:
      return 0;
  }

  // 3) 计算推荐奖励：min(被邀请人本金, 邀请人本金) × 邀请人静态收益率 × 邀请人返佣比例
  const limitedPrincipal = Math.min(inviteePrincipal, inviterPrincipal);
  const referralReward = Math.round(limitedPrincipal * inviterStaticRate * inviterReferralRate);

  return referralReward;
}
```

### 2. 档位参数函数
```javascript
function getInviterPlanParams(planCode) {
  const planParams = {
    'PLAN500': { staticRate: 0.06, referralRate: 1.0 },
    'PLAN1K': { staticRate: 0.07, referralRate: 0.9 },
    'PLAN2K': { staticRate: 0.08, referralRate: 0.8 },
    'PLAN5K': { staticRate: 0.10, referralRate: 0.7 }
  };
  return planParams[planCode] || { staticRate: 0, referralRate: 0 };
}
```

### 3. 推荐奖励计算函数
```javascript
function calculateReferralReward(inviterPrincipal, inviteePrincipal, inviterStaticRate, inviterReferralRate) {
  const limitedPrincipal = Math.min(inviteePrincipal, inviterPrincipal);
  return Math.round(limitedPrincipal * inviterStaticRate * inviterReferralRate);
}
```

## 🎯 业务规则

### 1. 统一公式
- 推荐奖励 = min(被邀请人本金, 邀请人本金) × 邀请人静态收益率 × 邀请人返佣比例
- 一条公式覆盖全部场景

### 2. 只看邀请人档位
- 收益率与返佣比例都取自邀请人自身
- 被邀请人档位只影响"min"那一步

### 3. 本金上限
- 始终取邀请人本金与被邀请人本金的较小值
- 超额部分不计入推荐奖励

### 4. 奖励分配
- 订单赎回时自动计算和分配推荐奖励
- 推荐奖励直接添加到邀请人的USDT余额
- 创建完整的推荐奖励记录

## 📊 奖励对比表

| 邀请人档位 | 被邀请人500U | 被邀请人1000U | 被邀请人2000U | 被邀请人5000U |
|-----------|-------------|---------------|---------------|---------------|
| PLAN500 | 30 USDT | 30 USDT | 30 USDT | 30 USDT |
| PLAN1K | 32 USDT | 63 USDT | 63 USDT | 63 USDT |
| PLAN2K | 32 USDT | 64 USDT | 128 USDT | 128 USDT |
| PLAN5K | 35 USDT | 70 USDT | 140 USDT | 350 USDT |

## ⚠️ 注意事项

1. **统一公式**：一条公式、两组常量（收益率 + 返佣比例）即可覆盖全部场景
2. **只看邀请人档位**：收益率与返佣比例都取自邀请人自身
3. **本金上限**：始终取邀请人本金与被邀请人本金的较小值
4. **自动分配**：系统自动计算和分配推荐奖励
5. **记录完整**：每次推荐奖励都有完整的交易记录

## 🎉 投资建议

1. **提升档位**：投资更高档位可以获得更多推荐奖励机会
2. **档位匹配**：邀请人档位决定了收益率和返佣比例
3. **收益最大化**：PLAN5K档位可以获得最高的推荐奖励
4. **长期规划**：考虑投资档位对推荐奖励的影响

## 📞 技术支持

如有问题，请检查：
1. 邀请人档位对应的收益率和返佣比例
2. 本金上限计算是否正确
3. 推荐奖励计算是否准确
4. 奖励分配是否正常 