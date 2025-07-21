#!/bin/bash

# 快速修复服务器上的Strapi项目
# 在服务器上运行此脚本

echo "🔧 快速修复Strapi项目..."

# 检查当前目录
CURRENT_DIR=$(pwd)
echo "当前目录: $CURRENT_DIR"

# 检查package.json是否存在
if [ -f "package.json" ]; then
    echo "✅ package.json 文件存在"
    echo "文件内容:"
    cat package.json
else
    echo "❌ package.json 文件不存在"
    echo "当前目录文件列表:"
    ls -la
    
    echo ""
    echo "🔍 查找package.json文件..."
    find /root -name "package.json" 2>/dev/null | head -5
    
    echo ""
    echo "📋 解决方案："
    echo "1. 确保您在正确的项目目录中"
    echo "2. 如果目录为空，需要从本地机器上传项目文件"
    echo "3. 使用以下命令上传项目："
    echo "   scp -r /path/to/local/strapi-ts/* root@服务器IP:/root/my-strapi-ts/"
    echo ""
    echo "4. 或者使用我们创建的部署脚本："
    echo "   ./complete-deploy.sh 服务器IP"
fi

echo ""
echo "📦 检查Node.js和Yarn安装状态..."
if command -v node &> /dev/null; then
    echo "✅ Node.js已安装: $(node --version)"
else
    echo "❌ Node.js未安装"
fi

if command -v yarn &> /dev/null; then
    echo "✅ Yarn已安装: $(yarn --version)"
else
    echo "❌ Yarn未安装"
fi

if command -v npm &> /dev/null; then
    echo "✅ NPM已安装: $(npm --version)"
else
    echo "❌ NPM未安装"
fi

echo ""
echo "🔧 如果package.json存在，尝试安装依赖..."
if [ -f "package.json" ]; then
    echo "安装依赖..."
    yarn install || npm install
    
    echo "构建项目..."
    yarn build || npm run build
    
    echo "✅ 修复完成！"
    echo "现在可以运行: yarn develop 或 yarn start"
else
    echo "❌ 无法修复，package.json文件缺失"
fi 