# 静态收益制度详细说明

## 🎯 制度概述

静态收益是投资平台的核心收益机制，用户通过购买不同档位的投资计划，在投资周期结束后获得固定的静态收益回报。

## 📊 投资计划档位

| 计划代码 | 投资金额 | 投资周期 | 静态收益率 | 静态收益金额 | AI Token奖励率 | AI Token奖励 | 抽奖次数 |
|---------|---------|---------|-----------|-------------|---------------|-------------|----------|
| PLAN500 | 500 USDT | 15天 | 6% | 30 USDT | 3% | 15 USDT | 3次 |
| PLAN1K | 1000 USDT | 20天 | 7% | 70 USDT | 4% | 40 USDT | 3次 |
| PLAN2K | 2000 USDT | 25天 | 8% | 160 USDT | 5% | 100 USDT | 3次 |
| PLAN5K | 5000 USDT | 30天 | 10% | 500 USDT | 6% | 300 USDT | 3次 |

## 🔄 收益计算逻辑

### 1. 静态收益计算
```
静态收益 = 投资金额 × 静态收益率
```

### 2. AI Token奖励计算
```
AI Token奖励 = 投资金额 × AI Token奖励率
```

### 3. 总收益计算
```
总收益 = 静态收益 + AI Token奖励
```

## 📝 详细示例

### 示例1：PLAN500投资
**投资情况：**
- 投资金额：500 USDT
- 投资周期：15天
- 静态收益率：6%

**收益计算：**
1. 静态收益：500 × 6% = 30 USDT
2. AI Token奖励：500 × 3% = 15 USDT
3. 总收益：30 + 15 = 45 USDT

**结果：** 15天后获得30 USDT静态收益 + 15 USDT AI Token + 3次抽奖资格

### 示例2：PLAN1K投资
**投资情况：**
- 投资金额：1000 USDT
- 投资周期：20天
- 静态收益率：7%

**收益计算：**
1. 静态收益：1000 × 7% = 70 USDT
2. AI Token奖励：1000 × 4% = 40 USDT
3. 总收益：70 + 40 = 110 USDT

**结果：** 20天后获得70 USDT静态收益 + 40 USDT AI Token + 3次抽奖资格

### 示例3：PLAN2K投资
**投资情况：**
- 投资金额：2000 USDT
- 投资周期：25天
- 静态收益率：8%

**收益计算：**
1. 静态收益：2000 × 8% = 160 USDT
2. AI Token奖励：2000 × 5% = 100 USDT
3. 总收益：160 + 100 = 260 USDT

**结果：** 25天后获得160 USDT静态收益 + 100 USDT AI Token + 3次抽奖资格

### 示例4：PLAN5K投资
**投资情况：**
- 投资金额：5000 USDT
- 投资周期：30天
- 静态收益率：10%

**收益计算：**
1. 静态收益：5000 × 10% = 500 USDT
2. AI Token奖励：5000 × 6% = 300 USDT
3. 总收益：500 + 300 = 800 USDT

**结果：** 30天后获得500 USDT静态收益 + 300 USDT AI Token + 3次抽奖资格

## ⚙️ 技术实现

### 1. 数据库结构
```javascript
// subscription_plans 表结构
{
  planCode: 'PLAN500',        // 计划代码
  principalUSDT: 500,         // 投资金额
  cycle_days: 15,             // 投资周期（天）
  staticPct: 6,               // 静态收益率（%）
  tokenBonusPct: 3,           // AI Token奖励率（%）
  enabled: true               // 是否启用
}
```

### 2. 收益计算函数
```javascript
function calculateStaticProfit(principal, staticPct) {
  return Math.round(principal * staticPct / 100);
}

function calculateTokenBonus(principal, tokenBonusPct) {
  return Math.round(principal * tokenBonusPct / 100);
}
```

### 3. 订单创建逻辑
```javascript
// 创建投资订单时设置到期时间
const now = new Date();
const endAt = new Date(now.getTime() + cycle_days * 24 * 60 * 60 * 1000);

const order = {
  user: userId,
  plan: planId,
  principalUSDT: principal,
  state: 'active',
  startAt: now,
  endAt: endAt
};
```

## 🎯 业务规则

### 1. 投资要求
- 用户必须有足够的USDT余额
- 每个计划有最大购买次数限制
- 投资金额必须等于计划规定的金额

### 2. 收益分配时机
- 订单到期时自动分配收益
- 支持手动提前赎回（需要到期）
- 定时任务每10分钟检查到期订单

### 3. 收益分配顺序
1. 给用户添加静态收益到USDT余额
2. 给用户添加AI Token奖励到AI Token余额
3. 处理推荐奖励（如果有邀请人）
4. 更新订单状态为已赎回

## 📈 收益特点

### 1. 递增收益
- 投资金额越高，收益率越高
- 投资周期越长，收益率越高
- 收益金额可预测

### 2. 双重收益
- USDT静态收益：直接到账USDT余额
- AI Token奖励：额外获得AI Token

### 3. 额外福利
- 抽奖次数：所有档位都是3次抽奖
- 推荐奖励：邀请他人投资可获得推荐奖励

## 🔍 收益验证

### 1. 计算验证
```javascript
// 验证静态收益计算
const principal = 500;
const staticPct = 6;
const expectedProfit = Math.round(principal * staticPct / 100); // 30 USDT

// 验证AI Token奖励计算
const tokenBonusPct = 3;
const expectedTokenBonus = Math.round(principal * tokenBonusPct / 100); // 15 USDT
```

### 2. 余额验证
```javascript
// 赎回后余额验证
const newUSDTBalance = originalUSDTBalance + staticProfit;
const newAITokenBalance = originalAITokenBalance + tokenBonus;
```

## ⚠️ 注意事项

1. **整数计算**：所有金额计算都使用整数，避免浮点数精度问题
2. **到期赎回**：只有到期后才能获得收益
3. **余额检查**：投资前会检查用户余额是否足够
4. **状态管理**：订单状态从active变为redeemed表示已赎回
5. **记录完整**：每次收益分配都会创建完整的交易记录

## 📊 收益对比表

| 投资金额 | 投资周期 | 静态收益率 | 静态收益 | AI Token奖励率 | AI Token奖励 | 总收益 | 年化收益率 |
|---------|---------|-----------|---------|---------------|-------------|--------|-----------|
| 500 USDT | 15天 | 6% | 30 USDT | 3% | 15 USDT | 45 USDT | 146% |
| 1000 USDT | 20天 | 7% | 70 USDT | 4% | 40 USDT | 110 USDT | 200% |
| 2000 USDT | 25天 | 8% | 160 USDT | 5% | 100 USDT | 260 USDT | 380% |
| 5000 USDT | 30天 | 10% | 500 USDT | 6% | 300 USDT | 800 USDT | 973% |

## 🎉 投资建议

1. **小额试水**：建议从PLAN500开始尝试
2. **分散投资**：可以购买多个不同档位的计划
3. **长期持有**：投资周期15-30天，适合短期投资
4. **复投策略**：收益可以继续投资获得复利效果

## 📞 技术支持

如有问题，请检查：
1. 用户余额是否足够
2. 投资计划是否启用
3. 订单状态是否正确
4. 收益计算是否准确 