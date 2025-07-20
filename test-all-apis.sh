#!/bin/bash

BASE_URL="http://118.107.4.158:1337"
echo "🔍 测试所有API接口..."
echo "📍 服务器: $BASE_URL"
echo ""

# 1. 测试服务器连接
echo "1. 测试服务器连接..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" "$BASE_URL"
echo ""

# 2. 测试健康检查
echo "2. 测试健康检查..."
curl -s "$BASE_URL/_health" | jq . 2>/dev/null || curl -s "$BASE_URL/_health"
echo ""

# 3. 测试用户注册
echo "3. 测试用户注册..."
USERNAME="testuser_$(date +%s)"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/invite-register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$USERNAME@example.com\",
    \"password\": \"password123\"
  }")

echo "注册响应:"
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# 4. 提取JWT token
JWT=$(echo "$REGISTER_RESPONSE" | jq -r '.jwt' 2>/dev/null)
if [ "$JWT" = "null" ] || [ -z "$JWT" ]; then
    echo "❌ 无法获取JWT token"
    exit 1
fi

echo "✅ JWT token获取成功: ${JWT:0:20}..."
echo ""

# 5. 测试钱包余额API
echo "5. 测试钱包余额API..."
echo "GET /api/wallet-balances/my"
curl -s -X GET "$BASE_URL/api/wallet-balances/my" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/wallet-balances/my" -H "Authorization: Bearer $JWT"
echo ""

# 6. 测试充值地址API
echo "6. 测试充值地址API..."
echo "GET /api/wallet-balances/deposit-address"
curl -s -X GET "$BASE_URL/api/wallet-balances/deposit-address" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/wallet-balances/deposit-address" -H "Authorization: Bearer $JWT"
echo ""

# 7. 测试管理员充值API
echo "7. 测试管理员充值API..."
echo "POST /api/wallet-balances/admin-recharge"
curl -s -X POST "$BASE_URL/api/wallet-balances/admin-recharge" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": 1,
    \"amount\": 100000000
  }" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/api/wallet-balances/admin-recharge" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"userId": 1, "amount": 100000000}'
echo ""

# 8. 测试订阅计划API
echo "8. 测试订阅计划API..."
echo "GET /api/subscription-plans"
curl -s -X GET "$BASE_URL/api/subscription-plans" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/subscription-plans" -H "Authorization: Bearer $JWT"
echo ""

# 9. 测试创建订阅订单API
echo "9. 测试创建订阅订单API..."
echo "POST /api/subscription-orders"
curl -s -X POST "$BASE_URL/api/subscription-orders" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{
    \"planCode\": \"PLAN500\"
  }" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/api/subscription-orders" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"planCode": "PLAN500"}'
echo ""

# 10. 测试我的订阅订单API
echo "10. 测试我的订阅订单API..."
echo "GET /api/subscription-orders/my"
curl -s -X GET "$BASE_URL/api/subscription-orders/my" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/subscription-orders/my" -H "Authorization: Bearer $JWT"
echo ""

# 11. 测试USDT提现API
echo "11. 测试USDT提现API..."
echo "POST /api/usdt-withdraws"
curl -s -X POST "$BASE_URL/api/usdt-withdraws" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 1000,
    \"address\": \"0x1234567890123456789012345678901234567890\"
  }" | jq . 2>/dev/null || curl -s -X POST "$BASE_URL/api/usdt-withdraws" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"amount": 1000, "address": "0x1234567890123456789012345678901234567890"}'
echo ""

# 12. 测试我的USDT提现API
echo "12. 测试我的USDT提现API..."
echo "GET /api/usdt-withdraws/my"
curl -s -X GET "$BASE_URL/api/usdt-withdraws/my" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/usdt-withdraws/my" -H "Authorization: Bearer $JWT"
echo ""

# 13. 测试推荐奖励API
echo "13. 测试推荐奖励API..."
echo "GET /api/referral-rewards/my"
curl -s -X GET "$BASE_URL/api/referral-rewards/my" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/referral-rewards/my" -H "Authorization: Bearer $JWT"
echo ""

# 14. 测试钱包交易记录API
echo "14. 测试钱包交易记录API..."
echo "GET /api/wallet-txes"
curl -s -X GET "$BASE_URL/api/wallet-txes" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/api/wallet-txes" -H "Authorization: Bearer $JWT"
echo ""

echo "🎉 所有API测试完成！" 