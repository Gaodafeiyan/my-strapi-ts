# 阶段-2 本地/预发联调 Checklist

## 假设金额全程用「整数 USDT」（单位 1 = 1 USDT，无小数）

### 0 代码与数据前置

| 操作 | 说明 | 状态 |
|------|------|------|
| 字段对齐 | 所有金额字段仍保留 numeric(40,8)，但写入整数<br>例：500 USDT 存 500；收益 30 USDT 存 30 | ✅ |
| 整数运算规范 | 1) 不再用 decimal.js<br>2) 所有百分比运算做 Math.round(principal * pct / 100)<br>3) 任何连除乘都在整数层完成 | ✅ |
| 测试数据库 | 重新 strapi develop --clean 生成空库；再跑种子文件插入 4 个 plan | ⏳ |
| 权限 | GUI 勾选 Authenticated 角色：subscription-orders/*, wallet-balances/*, usdt-withdraws/*, referral-rewards/* | ⏳ |

### 1 接口验证清单（Postman / Thunder Client）

| # | 场景 | 请求 | 断言（Status / 主要字段） | 状态 |
|---|------|------|---------------------------|------|
| 1 | 注册 A | POST /auth/invite-register (无 inviteCode) | 200；返回 diamondId / referralCode | ⏳ |
| 2 | 注册 B | 同上 + inviteCode = A.referralCode | 200；user.invitedBy.id === A.id | ⏳ |
| 3 | 充值 500U | 手动调 walletService.addUSDT(A, 500) 或插 WALLET_TX | A.walletBalance = 500 | ⏳ |
| 4 | B 充值 500U | 同步骤 3 | B.wallet = 500 | ⏳ |
| 5 | B 购买 PLAN500 | POST /subscription-orders {planCode:"PLAN500"} | 200；order.state=active；B.wallet=0 | ⏳ |
| 6 | 手动触发赎回 | POST /subscription-orders/:id/redeemManual | 200；order.state=redeemed | ⏳ |
| 7 | 赎回后余额 | GET /wallet-balances/my | B.wallet = 30；A.wallet = 530 (500+30) | ⏳ |
| 8 | 返佣记录 | GET /referral-rewards/my (Auth=A) | list.length =1；amount=30 | ⏳ |
| 9 | 提现 | POST /usdt-withdraws {amount:30,toAddress:"0x.."} (Auth=B) | 200；withdraw.status=pending；B.wallet=0 | ⏳ |
| 10 | 提现确认 | PUT /usdt-withdraws/:id/confirm {txHash:"0x123"} (Admin) | status=success | ⏳ |

**脚本化：** `tests/e2e.spec.ts` 已实现 1-8，可扩展提现用例。

### 2 前后端对字段命名约定

| 对外 JSON key | 含义 | 取值示例 |
|---------------|------|----------|
| principalUSDT | 本金 | 500 |
| staticYieldUSDT | 本次静态收益 | 30 |
| amountUSDT | 提现金额 / 返佣金额 | 30 |
| usdtBalance | 余额 | 0 / 530 |
| tokenBonusAmount | AI Token 奖励 | 15（整数 Token 数量） |

前端显示如需两位小数，可 `balance.toFixed(2)`。

### 3 Cron 任务调度

| Job 文件 | 频率 | 作用 |
|----------|------|------|
| redeem-cron.ts | */10 * * * * | 把到期 active 订单 → redeemed |
| deposit-listener.ts | */5 * * * * | (TODO) 轮询链上 USDT 收款；写 wallet-tx |
| withdraw-sender.ts | (可选) | 自动发起链上转账并 confirm |

在 `.env.development` 里保持 `ENABLE_CRON=true`；若前端测试想马上看到赎回效果，可保留 `redeemManual` 控制器接口。

### 4 后端日志级别

```env
LOG_LEVEL=info                     # dev
NODE_ENV=development
```

赎回 / 充值 / 提现 成功时 `logger.info` 带 orderNo 或 txHash

错误 `logger.error(err)` 保留堆栈方便排查

### 5 待补充的小细节（写死 TODO）

| 模块 | TODO | 备注 |
|------|------|------|
| Wallet Service | 负数检查 | addUSDT 若余额不足抛 INSUFFICIENT_BALANCE |
| Withdraw | 最低金额 & 手续费 | e.g. >=20 USDT；手动在 config 里常量 |
| Plan 解锁 | 服务层 hard-code 规则：500×2 完成后解 PLAN1K 等 | 已写 but 未单元测 |
| Lottery Module | spinQuotaGranted consumed→ lottery-spins | 下一 Sprint 实做 |
| Admin UI | 自定义页面「收益统计」 | P2 |

### 6 正式部署前最后一跳

- [ ] 跑 `npm run build` — 确认 TS→JS 编译通过
- [ ] Postgres 迁移

```bash
DATABASE_CLIENT=postgres DATABASE_URL=... \
npm run strapi database:migrate:up
npm run strapi database:seed  # 插入 4 个 plan
```

- [ ] HTTPS + CORS：在 `config/middlewares.ts` 开启 cors `{origin: ['https://app.example.com']}`
- [ ] PM2 进程 `pm2 start dist/server.js --name invest-api --max-memory-restart 400M`

### 7 把这份 checklist 发给 Cursor / 测试同学

复制以下：

```
### 联调 Checklist v0.2
✅ schema 固定、金额使用整数 USDT
✅ 所有依赖安装完成，编译无 TS 报错
🔎 按照 Sheet#1 场景 1-10 依次跑接口；保证状态码/余额/返佣与预期一致
🚀 本地通过后切 preprod，使用 Postgres 数据库
⚠️ 不得再改 content-type 字段；如需变动请先通过 Admin GUI & 同步到 Git
完成此表所有勾选项，就意味着「阶段-2 测试完毕，可转生产」。
```

## 测试脚本

### 快速测试命令

```bash
# 1. 清理并重新生成数据库
npm run strapi develop --clean

# 2. 运行种子数据
npm run strapi database:seed

# 3. 运行端到端测试
npm test

# 4. 启动开发服务器
npm run develop
```

### API 测试脚本

```bash
# 运行完整API测试
node test-api.js
```

## 注意事项

1. **整数计算**：所有金额计算都使用 `Math.round()` 确保整数
2. **数据库字段**：金额字段保持 `numeric(40,8)` 但只存储整数值
3. **权限配置**：确保在 Strapi Admin UI 中正确配置了 Authenticated 角色权限
4. **日志记录**：重要操作都有详细的日志记录
5. **错误处理**：所有接口都有适当的错误处理和状态码返回 