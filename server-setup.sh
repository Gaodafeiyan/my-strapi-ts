#!/bin/bash

# Server-side Strapi Setup Script
# Run this script on your Ubuntu server

echo "🚀 Setting up Strapi environment on Ubuntu server..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Create project directory
PROJECT_DIR="/root/strapi-project"
echo "📁 Creating project directory: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in $PROJECT_DIR"
    echo "Please upload your Strapi project files to this directory first."
    echo ""
    echo "You can use one of these methods:"
    echo "1. SCP: scp -r /path/to/local/strapi-ts/* root@$(hostname -I | awk '{print $1}'):$PROJECT_DIR/"
    echo "2. Git: git clone your-repo-url $PROJECT_DIR"
    echo "3. Manual upload via SFTP"
    exit 1
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Set up environment file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚙️ Setting up environment configuration..."
        cp .env.example .env
        echo "Please edit .env file with your production settings:"
        echo "nano .env"
    else
        echo "⚠️ No .env.example found. Please create .env file manually."
    fi
fi

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit environment file: nano .env"
echo "2. Start the application: npm run start"
echo "3. Or use PM2 for production: pm2 start npm --name 'strapi' -- run start"
echo ""
echo "To check if everything is working:"
echo "node -e \"JSON.parse(require('fs').readFileSync('package.json', 'utf8'))\"" 