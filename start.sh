#!/bin/bash

MODE=${1:-api}

echo "🚀 Starting n8n-Make Bridge..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Run ./setup.sh first"
    exit 1
fi

# Check if dist exists
if [ ! -d dist ]; then
    echo "⚠️  Project not built. Building now..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi
fi

case $MODE in
    api)
        echo "🌐 Starting REST API server..."
        echo "   API will be available at http://localhost:3000"
        echo ""
        npm start
        ;;
    mcp)
        echo "🤖 Starting MCP server for Claude Desktop..."
        echo "   Make sure this is configured in Claude Desktop config"
        echo ""
        npm run start:mcp
        ;;
    dev)
        echo "🔧 Starting in development mode..."
        npm run dev
        ;;
    dev:mcp)
        echo "🔧 Starting MCP server in development mode..."
        npm run dev:mcp
        ;;
    *)
        echo "Usage: ./start.sh [api|mcp|dev|dev:mcp]"
        echo ""
        echo "Modes:"
        echo "  api       - Start REST API server (default)"
        echo "  mcp       - Start MCP server for Claude Desktop"
        echo "  dev       - Start API in development mode"
        echo "  dev:mcp   - Start MCP in development mode"
        exit 1
        ;;
esac
