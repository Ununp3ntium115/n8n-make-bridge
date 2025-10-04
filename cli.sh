#!/bin/bash

# Check if built
if [ ! -d dist ]; then
    echo "⚠️  Project not built. Building now..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi
fi

# Run CLI
node dist/cli.js
