#!/bin/bash

# 用户 Schema 修复部署脚本
# 用于修复用户模型中缺失的 diamondId、referralCode、invitedBy 字段

set -e

echo "🔧 开始用户 Schema 修复部署..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 检查 Node.js 和 npm
check_dependencies() {
    log "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
        exit 1
    fi
    
    log "Node.js 版本: $(node --version)"
    log "npm 版本: $(npm --version)"
}

# 安装依赖
install_dependencies() {
    log "安装依赖..."
    
    if [ ! -f "package-lock.json" ]; then
        warn "package-lock.json 不存在，将重新安装所有依赖"
        npm ci
    else
        npm install
    fi
    
    log "依赖安装完成"
}

# 构建应用
build_application() {
    log "构建 Strapi 应用..."
    
    # 清理之前的构建
    if [ -d "dist" ]; then
        log "清理之前的构建文件..."
        rm -rf dist
    fi
    
    # 构建应用
    npm run build
    
    if [ $? -eq 0 ]; then
        log "应用构建成功"
    else
        error "应用构建失败"
        exit 1
    fi
}

# 运行数据库迁移
run_migrations() {
    log "运行数据库迁移..."
    
    # 检查是否有迁移文件
    if [ -f "database/seeds/002_fix_user_fields.js" ]; then
        log "发现用户字段修复迁移文件"
        
        # 这里需要根据实际的 Strapi 迁移机制来运行
        # 通常需要重启 Strapi 服务来应用 Schema 更改
        warn "Schema 更改需要重启 Strapi 服务才能生效"
    else
        warn "未找到用户字段修复迁移文件"
    fi
}

# 运行修复脚本
run_fix_scripts() {
    log "运行修复脚本..."
    
    # 运行用户 Schema 修复脚本
    if [ -f "run-user-schema-fix.js" ]; then
        log "运行用户 Schema 修复脚本..."
        node run-user-schema-fix.js
    else
        error "未找到用户 Schema 修复脚本"
        exit 1
    fi
}

# 验证修复结果
verify_fix() {
    log "验证修复结果..."
    
    # 运行验证脚本
    if [ -f "test_all_apis.js" ]; then
        log "运行 API 测试..."
        node test_all_apis.js
    else
        warn "未找到 API 测试脚本"
    fi
}

# 重启服务
restart_service() {
    log "重启 Strapi 服务..."
    
    # 这里需要根据实际的服务管理方式来重启
    # 例如使用 PM2、systemd 等
    
    warn "请手动重启 Strapi 服务以应用所有更改"
    warn "重启命令示例:"
    warn "  - PM2: pm2 restart strapi"
    warn "  - systemd: sudo systemctl restart strapi"
    warn "  - 直接运行: npm run start"
}

# 主函数
main() {
    log "开始用户 Schema 修复部署流程..."
    
    # 检查当前目录
    if [ ! -f "package.json" ]; then
        error "请在 Strapi 项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行各个步骤
    check_dependencies
    install_dependencies
    build_application
    run_migrations
    run_fix_scripts
    verify_fix
    restart_service
    
    log "用户 Schema 修复部署完成！"
    echo ""
    log "下一步操作："
    log "1. 重启 Strapi 服务"
    log "2. 检查管理界面中的用户字段"
    log "3. 测试用户注册功能"
    log "4. 验证邀请注册功能"
    echo ""
    log "如有问题，请检查日志文件或联系技术支持"
}

# 错误处理
trap 'error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@" 