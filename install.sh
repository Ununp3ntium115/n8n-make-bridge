#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   n8n-Make Bridge - One-Step Install  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Make scripts executable
chmod +x setup.sh start.sh cli.sh

# Run setup
./setup.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║          ✅ Installation Complete!     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""

    # Ask if user wants to run configuration wizard
    read -p "Would you like to configure your API keys now? (Y/n): " configure_now

    if [ "$configure_now" != "n" ] && [ "$configure_now" != "N" ]; then
        echo ""
        ./configure.sh
    else
        echo ""
        echo "📝 Configure later with:"
        echo "   ./configure.sh    # Interactive wizard"
        echo "   OR"
        echo "   nano .env         # Manual editing"
        echo ""
        echo "📚 Full setup guide:"
        echo "   See COMPLETE_SETUP_GUIDE.md"
        echo ""
        echo "🚀 After configuring, start with:"
        echo "   ./cli.sh          # Interactive CLI"
        echo "   ./start.sh api    # REST API"
        echo "   ./start.sh mcp    # MCP for Claude"
        echo ""
    fi
else
    echo ""
    echo "❌ Installation failed. Check errors above."
    exit 1
fi
