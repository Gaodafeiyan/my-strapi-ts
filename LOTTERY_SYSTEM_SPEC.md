# 抽奖系统功能说明

## 🎰 抽奖系统概述

抽奖系统包含机率控制、奖品管理、轮播图展示等完整功能。

## 📋 功能模块

### 1. 抽奖配置 (lottery-config)
- **中奖率控制**: 可调节整体中奖率（默认30%）
- **抽奖费用**: 每次抽奖消耗的USDT
- **奖品数量限制**: 最大奖品数量
- **启用状态**: 控制抽奖功能开关

### 2. 奖品管理 (lottery-prize)
- **奖品名称**: 奖品显示名称
- **奖品金额**: USDT奖励金额
- **权重设置**: 影响中奖后的奖品选择概率
- **库存管理**: 奖品库存数量（-1为无限）
- **启用状态**: 控制奖品是否可用

### 3. 抽奖记录 (lottery-spin)
- **用户信息**: 抽奖用户
- **奖品信息**: 获得的奖品
- **抽奖结果**: 中奖/未中奖
- **费用记录**: 抽奖消耗的USDT
- **奖励发放**: 自动发放到用户钱包

### 4. 轮播图管理 (lottery-banner)
- **图片上传**: 支持图片上传
- **排序控制**: 轮播图显示顺序
- **链接设置**: 点击跳转链接
- **启用状态**: 控制是否显示

## 🎯 机率控制机制

### 中奖率控制
```typescript
// 首先决定是否中奖
const randomWin = Math.random() * 100;
const isWin = randomWin <= winRate; // winRate 可配置
```

### 奖品权重分配
```typescript
// 中奖后，基于权重选择具体奖品
const totalWeight = winningPrizes.reduce((sum, prize) => sum + prize.weight, 0);
let random = Math.random() * totalWeight;

for (const prize of winningPrizes) {
  random -= prize.weight;
  if (random <= 0) {
    selectedPrize = prize;
    break;
  }
}
```

## 📊 默认奖品配置

| 奖品等级 | 金额(USDT) | 权重 | 中奖概率 |
|----------|------------|------|----------|
| 特等奖   | 1000       | 1    | 0.1%     |
| 一等奖   | 500        | 3    | 0.3%     |
| 二等奖   | 200        | 10   | 1%       |
| 三等奖   | 100        | 20   | 2%       |
| 四等奖   | 50         | 50   | 5%       |
| 五等奖   | 20         | 100  | 10%      |
| 谢谢参与 | 0          | 200  | 20%      |

**总中奖率**: 30% (可调节)

## 🔧 API 接口

### 抽奖相关
- `GET /api/lottery-configs` - 获取抽奖配置
- `GET /api/lottery-prizes` - 获取奖品列表
- `POST /api/lottery-spins/spin` - 执行抽奖
- `GET /api/lottery-spins/my` - 获取我的抽奖记录

### 轮播图相关
- `GET /api/lottery-banners/active` - 获取活跃轮播图

## 🎨 轮播图功能

### 轮播图字段
- **title**: 轮播图标题
- **image**: 轮播图片（支持上传）
- **link**: 点击跳转链接
- **sortOrder**: 排序顺序
- **enabled**: 是否启用

### 轮播图展示
- 按 `sortOrder` 升序排列
- 只显示 `enabled: true` 的轮播图
- 支持图片媒体文件上传

## 🛠️ 管理功能

### 机率调节
1. 在 Strapi 管理面板中编辑 `lottery-config`
2. 修改 `winRate` 字段调整中奖率
3. 保存后立即生效

### 奖品管理
1. 在 `lottery-prize` 中添加/编辑奖品
2. 设置奖品金额和权重
3. 控制奖品启用状态

### 轮播图管理
1. 在 `lottery-banner` 中上传轮播图
2. 设置排序顺序和跳转链接
3. 控制轮播图显示状态

## 📱 前端集成

### 抽奖页面需要的数据
```javascript
// 获取抽奖配置
const config = await fetch('/api/lottery-configs');

// 获取奖品列表
const prizes = await fetch('/api/lottery-prizes');

// 获取轮播图
const banners = await fetch('/api/lottery-banners/active');

// 执行抽奖
const result = await fetch('/api/lottery-spins/spin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 轮播图组件示例
```javascript
// 轮播图数据结构
{
  id: 1,
  title: "幸运抽奖",
  image: {
    url: "/uploads/lottery_banner_1.jpg",
    width: 800,
    height: 400
  },
  link: "/lottery",
  sortOrder: 1
}
```

## 🚀 部署说明

### 1. 构建项目
```bash
npm run strapi build
```

### 2. 运行数据种子
```bash
node database/seeds/lottery-data.js
```

### 3. 重启服务
```bash
npm run develop
```

## 📈 运营建议

### 机率调节策略
- **新用户**: 提高中奖率到50%，增加用户粘性
- **活跃用户**: 保持30%中奖率，平衡收益
- **节假日**: 临时提高中奖率，增加活动效果

### 奖品设置建议
- **大奖**: 设置较低权重，保持稀缺性
- **小奖**: 设置较高权重，保证用户参与感
- **空奖**: 适当设置，控制成本

### 轮播图运营
- **活动宣传**: 上传抽奖活动宣传图
- **奖品展示**: 展示大奖奖品图片
- **用户引导**: 设置跳转链接到抽奖页面 