// 测试整数计算的正确性
console.log('🧮 测试整数计算...\n');

// 测试场景1：500 USDT购买，6%收益
const principal = 500;
const staticPct = 6;
const staticProfit = Math.round(principal * staticPct / 100);
console.log(`场景1: ${principal} USDT × ${staticPct}% = ${staticProfit} USDT`);

// 测试场景2：推荐奖励10%
const referralPct = 10;
const referralProfit = Math.round(staticProfit * referralPct / 100);
console.log(`场景2: ${staticProfit} USDT × ${referralPct}% = ${referralProfit} USDT`);

// 测试场景3：多轮计算
const orders = [
  { principal: 500, staticPct: 6 },
  { principal: 1000, staticPct: 6 },
  { principal: 2000, staticPct: 6 }
];

let totalProfit = 0;
orders.forEach((order, index) => {
  const profit = Math.round(order.principal * order.staticPct / 100);
  totalProfit += profit;
  console.log(`订单${index + 1}: ${order.principal} × ${order.staticPct}% = ${profit} USDT`);
});

console.log(`总收益: ${totalProfit} USDT`);

// 测试场景4：验证没有浮点数误差
const testCases = [
  { principal: 100, pct: 6, expected: 6 },
  { principal: 500, pct: 6, expected: 30 },
  { principal: 1000, pct: 6, expected: 60 },
  { principal: 2000, pct: 6, expected: 120 },
  { principal: 5000, pct: 6, expected: 300 }
];

console.log('\n✅ 验证计算结果:');
testCases.forEach((test, index) => {
  const result = Math.round(test.principal * test.pct / 100);
  const isCorrect = result === test.expected;
  console.log(`测试${index + 1}: ${test.principal} × ${test.pct}% = ${result} (${isCorrect ? '✅' : '❌'})`);
});

console.log('\n🎉 整数计算测试完成！');
console.log('所有金额都是整数，避免了浮点数精度问题。'); 