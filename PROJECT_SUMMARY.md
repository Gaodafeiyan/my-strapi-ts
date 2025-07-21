# Strapi 后端项目总结

## 项目概述
这是一个基于 Strapi 5.18.0 的后端API项目，使用 TypeScript 开发，包含完整的用户权限、订阅计划、推荐奖励、抽奖系统等功能。

## 项目结构

### 核心目录
```
strapi-ts/
├── src/
│   ├── api/                    # API 模块
│   │   ├── auth/              # 认证相关
│   │   ├── subscription-plan/ # 订阅计划
│   │   ├── subscription-order/# 订阅订单
│   │   ├── referral-reward/   # 推荐奖励
│   │   ├── lottery-*/         # 抽奖系统
│   │   ├── wallet-*/          # 钱包系统
│   │   └── usdt-withdraw/     # USDT提现
│   ├── extensions/            # 扩展功能
│   ├── policies/              # 权限策略
│   └── shared/                # 共享组件
├── config/                    # 配置文件
├── database/                  # 数据库相关
├── public/                    # 静态文件
└── test/                      # 测试文件
```

### 主要功能模块

1. **用户认证系统** (`auth/`)
   - 用户注册/登录
   - JWT 认证
   - 权限管理

2. **订阅计划系统** (`subscription-plan/`, `subscription-order/`)
   - 订阅计划管理
   - 订单处理
   - 支付集成

3. **推荐奖励系统** (`referral-reward/`)
   - 推荐关系管理
   - 奖励计算
   - 佣金分配

4. **抽奖系统** (`lottery-*/`)
   - 抽奖配置
   - 奖品管理
   - 抽奖逻辑

5. **钱包系统** (`wallet-*/`, `usdt-withdraw/`)
   - 余额管理
   - 交易记录
   - USDT提现

## 技术栈

- **框架**: Strapi 5.18.0
- **语言**: TypeScript
- **数据库**: SQLite (开发) / MySQL/PostgreSQL (生产)
- **包管理**: Yarn
- **测试**: Vitest
- **进程管理**: PM2 (生产)

## 依赖包

### 核心依赖
- `@strapi/strapi`: 5.18.0
- `@strapi/plugin-users-permissions`: 5.18.0
- `better-sqlite3`: 9.4.3
- `decimal.js-light`: ^2.5.1 (精确计算)
- `nanoid`: ^5.0.6 (ID生成)

### 前端依赖
- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `react-router-dom`: ^6.0.0
- `styled-components`: ^6.0.0

## 部署指南

### 方法1: 使用完整部署脚本
```bash
# 在本地项目目录运行
chmod +x complete-deploy.sh
./complete-deploy.sh 您的服务器IP
```

### 方法2: 手动部署
```bash
# 1. 连接到服务器
ssh root@您的服务器IP

# 2. 创建项目目录
mkdir -p /root/my-strapi-ts
cd /root/my-strapi-ts

# 3. 从本地上传文件
# 在本地机器运行:
scp -r /path/to/strapi-ts/* root@服务器IP:/root/my-strapi-ts/

# 4. 安装依赖
yarn install

# 5. 创建环境配置
cat > .env << EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
NODE_ENV=production
EOF

# 6. 构建项目
yarn build

# 7. 启动应用
yarn start
```

### 方法3: 使用PM2 (生产环境)
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs strapi
```

## 环境配置

### 开发环境
```bash
NODE_ENV=development
HOST=localhost
PORT=1337
```

### 生产环境
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=mysql  # 或 postgres
```

## 数据库配置

### SQLite (开发)
```bash
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### MySQL (生产)
```bash
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-password
```

## 常见问题解决

### 1. package.json 文件缺失
```bash
# 运行快速修复脚本
chmod +x quick-fix-server.sh
./quick-fix-server.sh
```

### 2. 权限问题
```bash
# 检查文件权限
ls -la package.json

# 修复权限
chmod 644 package.json
```

### 3. 依赖安装失败
```bash
# 清理缓存
yarn cache clean
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
yarn install
```

## API 文档

详细的API文档请参考：
- `COMPLETE_API_DOCUMENTATION.md`
- `API_TEST_GUIDE.md`
- `API_TEST_README.md`

## 测试

### 运行测试
```bash
# 单元测试
yarn test

# 运行测试
yarn test:run
```

### API测试
```bash
# 运行API测试脚本
node test-complete-api.js
```

## 监控和维护

### 日志查看
```bash
# PM2日志
pm2 logs strapi

# 应用日志
tail -f .tmp/logs/app.log
```

### 性能监控
```bash
# PM2监控
pm2 monit

# 系统资源
htop
```

## 安全建议

1. **环境变量**: 确保所有敏感信息都在 `.env` 文件中
2. **防火墙**: 配置服务器防火墙，只开放必要端口
3. **SSL证书**: 生产环境使用HTTPS
4. **定期备份**: 定期备份数据库和配置文件
5. **更新依赖**: 定期更新依赖包以修复安全漏洞

## 联系信息

如有问题，请查看项目文档或联系开发团队。 