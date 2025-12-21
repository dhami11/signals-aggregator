#!/bin/bash

# Discord Alert Monitor - Quick Deployment Setup
# This script prepares your project for deployment

set -e

echo "🚀 Discord Alert Monitor - Deployment Setup"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker found"

# Check if .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo ""
        echo "📝 Creating .env from .env.example"
        cp .env.example .env
        echo "⚠️  Edit .env with your actual Discord token and channel ID"
    else
        echo "❌ No .env or .env.example file found"
        exit 1
    fi
fi

echo ""
echo "🏗️  Building Docker image..."
docker build -t discord-monitor:latest .

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Local testing:"
echo "   docker-compose up"
echo ""
echo "2. Deploy to Railway (recommended):"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Add your environment variables"
echo "   - Deploy!"
echo ""
echo "3. For other deployment options, see DEPLOYMENT.md"
echo ""
echo "Need help? Check DEPLOYMENT.md for complete instructions!"
