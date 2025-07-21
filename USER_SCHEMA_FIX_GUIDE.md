# 用户 Schema 修复指南

## 问题描述

用户模型中缺少以下字段：
- `diamondId`: 用户唯一标识符
- `referralCode`: 推荐码
- `invitedBy`: 邀请人关系

## 修复步骤

### 1. 更新 Schema 文件

已更新的文件：
- `src/extensions/users-permissions/content-types/user/schema.json`
- `src/extensions/users-permissions/content-types/user/schema.ts`

新增字段：
```json
{
  "diamondId": {
    "type": "string",
    "unique": true,
    "required": true,
    "minLength": 9,
    "maxLength": 9
  },
  "referralCode": {
    "type": "string",
    "unique": true,
    "required": true,
    "minLength": 9,
    "maxLength": 9
  },
  "invitedBy": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "plugin::users-permissions.user",
    "inversedBy": "invitedUsers"
  },
  "invitedUsers": {
    "type": "relation",
    "relation": "oneToMany",
    "target": "plugin::users-permissions.user",
    "mappedBy": "invitedBy"
  }
}
```

### 2. 安装依赖

```bash
npm install nanoid@^5.0.6
```

### 3. 重新构建应用

```bash
npm run build
```

### 4. 重启 Strapi 服务

```bash
# 如果使用 PM2
pm2 restart strapi

# 如果使用 systemd
sudo systemctl restart strapi

# 如果直接运行
npm run start
```

### 5. 运行修复脚本

```bash
node run-user-schema-fix.js
```

### 6. 验证修复结果

```bash
node test_all_apis.js
```

## 自动化部署

使用提供的部署脚本：

```bash
chmod +x deploy-user-schema-fix.sh
./deploy-user-schema-fix.sh
```

## 验证清单

- [ ] Schema 文件已更新
- [ ] 依赖已安装
- [ ] 应用已重新构建
- [ ] 服务已重启
- [ ] 修复脚本已运行
- [ ] API 测试通过
- [ ] 用户注册功能正常
- [ ] 邀请注册功能正常

## 测试用例

### 1. 用户注册测试

```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

预期响应：
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "ABC123456",
    "referralCode": "XYZ789012",
    "invitedBy": null,
    "role": "authenticated"
  }
}
```

### 2. 邀请注册测试

```bash
curl -X POST http://118.107.4.158:1337/api/auth/invite-register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "invitee",
    "email": "invitee@example.com",
    "password": "password123",
    "inviteCode": "XYZ789012"
  }'
```

## 故障排除

### 1. 字段不存在错误

如果遇到字段不存在的错误：
1. 确保已重新构建应用
2. 确保已重启服务
3. 检查数据库表结构

### 2. 权限错误

如果遇到权限错误：
1. 运行权限配置脚本
2. 检查角色设置
3. 验证 API 权限

### 3. 类型错误

如果遇到 TypeScript 类型错误：
1. 检查 schema.ts 文件
2. 确保类型定义正确
3. 重新编译 TypeScript

## 联系信息

如有问题，请检查：
1. 服务器日志
2. 数据库连接
3. 网络连接
4. 权限设置 