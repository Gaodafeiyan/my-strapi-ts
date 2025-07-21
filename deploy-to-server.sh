#!/bin/bash

# Strapi Project Deployment Script
# Usage: ./deploy-to-server.sh [server-ip] [username]

SERVER_IP=${1:-"your-server-ip"}
USERNAME=${2:-"root"}
PROJECT_DIR="/root/strapi-project"
LOCAL_DIR="."

echo "🚀 Starting Strapi deployment to $SERVER_IP..."

# Check if server IP is provided
if [ "$SERVER_IP" = "your-server-ip" ]; then
    echo "❌ Please provide your server IP as the first argument"
    echo "Usage: ./deploy-to-server.sh [server-ip] [username]"
    exit 1
fi

# Test server connection
echo "🔍 Testing connection to $SERVER_IP..."
if ! ssh -o ConnectTimeout=10 $USERNAME@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to server. Please check your IP and SSH configuration."
    exit 1
fi

# Create project directory on server
echo "📁 Creating project directory on server..."
ssh $USERNAME@$SERVER_IP "mkdir -p $PROJECT_DIR"

# Upload project files
echo "📤 Uploading project files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.strapi' $LOCAL_DIR/ $USERNAME@$SERVER_IP:$PROJECT_DIR/

# Install dependencies on server
echo "📦 Installing dependencies on server..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && npm install"

# Set up environment file
echo "⚙️ Setting up environment configuration..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && cp .env.example .env"

# Build the project
echo "🔨 Building the project..."
ssh $USERNAME@$SERVER_IP "cd $PROJECT_DIR && npm run build"

echo "✅ Deployment completed!"
echo ""
echo "Next steps on your server:"
echo "1. SSH into your server: ssh $USERNAME@$SERVER_IP"
echo "2. Navigate to project: cd $PROJECT_DIR"
echo "3. Edit environment file: nano .env"
echo "4. Start the application: npm run start"
echo ""
echo "For production, consider using PM2:"
echo "npm install -g pm2"
echo "pm2 start npm --name 'strapi' -- run start" 