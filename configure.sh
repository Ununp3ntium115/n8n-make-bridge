#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   n8n-Make Bridge Configuration Wizard ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Keeping existing .env file. Edit it manually if needed."
        exit 0
    fi
fi

echo -e "${BLUE}This wizard will help you configure your API keys.${NC}"
echo ""

# ============================================
# n8n Configuration
# ============================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  n8n Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Where is your n8n instance?"
echo "  1) Local (http://localhost:5678)"
echo "  2) n8n Cloud"
echo "  3) Custom URL"
read -p "Choice (1/2/3): " n8n_choice

case $n8n_choice in
    1)
        N8N_BASE_URL="http://localhost:5678"
        ;;
    2)
        read -p "Enter your n8n cloud subdomain (e.g., 'mycompany' for mycompany.app.n8n.cloud): " subdomain
        N8N_BASE_URL="https://${subdomain}.app.n8n.cloud"
        ;;
    3)
        read -p "Enter your n8n URL: " custom_url
        N8N_BASE_URL="$custom_url"
        ;;
    *)
        N8N_BASE_URL="http://localhost:5678"
        ;;
esac

echo ""
echo -e "${BLUE}📝 How to get your n8n API key:${NC}"
echo "  1. Open n8n: $N8N_BASE_URL"
echo "  2. Click your profile (bottom left)"
echo "  3. Go to Settings → API"
echo "  4. Click 'Create API Key'"
echo "  5. Copy the key (starts with 'n8n_api_')"
echo ""

read -p "Enter your n8n API key: " N8N_API_KEY

# Test n8n connection
echo ""
echo -e "${BLUE}🔍 Testing n8n connection...${NC}"
response=$(curl -s -w "%{http_code}" -o /dev/null -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows")

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ n8n connection successful!${NC}"
else
    echo -e "${RED}❌ Could not connect to n8n (HTTP $response)${NC}"
    echo -e "${YELLOW}⚠️  Please check your URL and API key${NC}"
fi

# ============================================
# Make.com Configuration
# ============================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Make.com Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📝 How to get your Make.com API token:${NC}"
echo "  1. Log in to https://www.make.com"
echo "  2. Click your profile picture (top right)"
echo "  3. Click 'API'"
echo "  4. Click 'Add Token'"
echo "  5. Copy the token (64 characters)"
echo ""

read -p "Enter your Make.com API token: " MAKE_API_TOKEN

echo ""
echo "What region is your Make.com account in?"
echo "  1) EU (eu1) - https://eu1.make.com"
echo "  2) EU2 (eu2) - https://eu2.make.com"
echo "  3) US (us1) - https://us1.make.com"
echo "  4) US2 (us2) - https://us2.make.com"
read -p "Choice (1/2/3/4): " region_choice

case $region_choice in
    1) MAKE_REGION="eu1" ;;
    2) MAKE_REGION="eu2" ;;
    3) MAKE_REGION="us1" ;;
    4) MAKE_REGION="us2" ;;
    *) MAKE_REGION="eu1" ;;
esac

# Test Make.com connection
echo ""
echo -e "${BLUE}🔍 Testing Make.com connection...${NC}"
make_response=$(curl -s -w "%{http_code}" -o /dev/null -H "Authorization: Token $MAKE_API_TOKEN" "https://${MAKE_REGION}.make.com/api/v2/scenarios")

if [ "$make_response" = "200" ]; then
    echo -e "${GREEN}✅ Make.com connection successful!${NC}"
else
    echo -e "${RED}❌ Could not connect to Make.com (HTTP $make_response)${NC}"
    echo -e "${YELLOW}⚠️  Please check your token and region${NC}"
fi

# ============================================
# Optional: Team/Org IDs
# ============================================

echo ""
echo -e "${BLUE}Optional: Team/Organization IDs (press Enter to skip)${NC}"
echo ""

read -p "Make.com Team ID (optional): " MAKE_TEAM_ID
read -p "Make.com Organization ID (optional): " MAKE_ORG_ID

# ============================================
# Optional: AI Services
# ============================================

echo ""
echo -e "${BLUE}Optional: AI Service API Keys (press Enter to skip)${NC}"
echo ""

read -p "OpenAI API Key (optional): " OPENAI_API_KEY
read -p "Anthropic API Key (optional): " ANTHROPIC_API_KEY

# ============================================
# Server Configuration
# ============================================

echo ""
read -p "REST API Server Port (default: 3000): " PORT
PORT=${PORT:-3000}

# ============================================
# Write .env file
# ============================================

echo ""
echo -e "${BLUE}💾 Writing configuration to .env file...${NC}"

cat > .env << EOF
# ============================================
#  n8n Configuration
# ============================================

N8N_BASE_URL=$N8N_BASE_URL
N8N_API_KEY=$N8N_API_KEY

# ============================================
#  Make.com Configuration
# ============================================

MAKE_API_TOKEN=$MAKE_API_TOKEN
MAKE_REGION=$MAKE_REGION
MAKE_TEAM_ID=$MAKE_TEAM_ID
MAKE_ORG_ID=$MAKE_ORG_ID

# ============================================
#  Server Configuration
# ============================================

PORT=$PORT
NODE_ENV=development

# ============================================
#  Optional: AI Services
# ============================================

OPENAI_API_KEY=$OPENAI_API_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# ============================================
#  Optional: Debug
# ============================================

DEBUG=false
LOG_LEVEL=info
EOF

echo -e "${GREEN}✅ Configuration saved to .env${NC}"
echo ""

# ============================================
# Summary
# ============================================

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Configuration Complete!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo "📋 Summary:"
echo "  • n8n URL: $N8N_BASE_URL"
echo "  • Make.com Region: $MAKE_REGION"
echo "  • Server Port: $PORT"
echo ""

echo "🚀 Next steps:"
echo ""
echo "  1. Start the interactive CLI:"
echo -e "     ${BLUE}./cli.sh${NC}"
echo ""
echo "  2. OR start the REST API server:"
echo -e "     ${BLUE}./start.sh api${NC}"
echo ""
echo "  3. OR start MCP server for Claude:"
echo -e "     ${BLUE}./start.sh mcp${NC}"
echo ""

echo "💡 Quick test:"
echo -e "   ${BLUE}./cli.sh${NC}"
echo "   Then type: templates"
echo ""

echo -e "${GREEN}Happy automating! 🎉${NC}"
echo ""
