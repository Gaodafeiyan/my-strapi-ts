#!/bin/bash

# 完整的Strapi项目部署脚本
# 使用方法: ./complete-deploy.sh [服务器IP] [用户名]

SERVER_IP=${1:-"your-server-ip"}
USERNAME=${2:-"root"}
PROJECT_DIR="/root/my-strapi-ts"
LOCAL_DIR="."

echo "🚀 开始部署Strapi项目到 $SERVER_IP..."

# 检查服务器IP是否提供
if [ "$SERVER_IP" = "your-server-ip" ]; then
    echo "❌ 请提供您的服务器IP作为第一个参数"
    echo "使用方法: ./complete-deploy.sh [服务器IP] [用户名]"
    exit 1
fi

# 测试服务器连接
echo "🔍 测试连接到 $SERVER_IP..."
if ! ssh -o ConnectTimeout=10 $USERNAME@$SERVER_IP "echo '连接成功'" 2>/dev/null; then
    echo "❌ 无法连接到服务器。请检查您的IP和SSH配置。"
    exit 1
fi

# 在服务器上安装必要的软件
echo "📦 在服务器上安装必要的软件..."
ssh $USERNAME@$SERVER_IP "
    # 更新系统包
    apt update && apt upgrade -y
    
    # 安装Node.js (如果未安装)
    if ! command -v node &> /dev/null; then
        echo '安装Node.js...'
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    else
        echo 'Node.js已安装: ' \$(node --version)
    fi
    
    # 安装yarn (如果未安装)
    if ! command -v yarn &> /dev/null; then
        echo '安装Yarn...'
        npm install -g yarn
    else
        echo 'Yarn已安装: ' \$(yarn --version)
    fi
    
    # 安装PM2 (用于生产环境)
    if ! command -v pm2 &> /dev/null; then
        echo '安装PM2...'
        npm install -g pm2
    else
        echo 'PM2已安装'
    fi
"

# 清理并创建项目目录
echo "📁 清理并创建项目目录..."
ssh $USERNAME@$SERVER_IP "rm -rf $PROJECT_DIR && mkdir -p $PROJECT_DIR"

# 上传项目文件
echo "📤 上传项目文件..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.strapi' --exclude 'database/.tmp' $LOCAL_DIR/ $USERNAME@$SERVER_IP:$PROJECT_DIR/

# 创建环境配置文件
echo "⚙️ 创建环境配置文件..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && cat > .env << 'EOF'
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here

# 数据库配置 (SQLite)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# 其他配置
NODE_ENV=production
EOF"

# 安装依赖
echo "📦 安装项目依赖..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && yarn install"

# 构建项目
echo "🔨 构建项目..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && yarn build"

# 创建启动脚本
echo "📝 创建启动脚本..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && cat > start.sh << 'EOF'
#!/bin/bash
cd $PROJECT_DIR
echo '启动Strapi应用...'
yarn start
EOF"

ssh $USERNAME@$SERVER_IP "chmod +x $PROJECT_DIR/start.sh"

# 创建PM2配置文件
echo "📝 创建PM2配置文件..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'strapi',
    script: 'yarn',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF"

echo "✅ 部署完成！"
echo ""
echo "下一步操作："
echo "1. SSH连接到服务器: ssh $USERNAME@$SERVER_IP"
echo "2. 进入项目目录: cd $PROJECT_DIR"
echo "3. 检查package.json: ls -la"
echo "4. 启动应用: yarn develop (开发模式) 或 yarn start (生产模式)"
echo "5. 或使用PM2: pm2 start ecosystem.config.js"
echo ""
echo "验证部署："
echo "ssh $USERNAME@$SERVER_IP 'cd $PROJECT_DIR && node -e \"JSON.parse(require(\\\"fs\\\").readFileSync(\\\"package.json\\\", \\\"utf8\\\"))\"'" 