# n8n ↔️ Make.com Bridge

<div align="center">

**🤖 AI-Powered Workflow Automation Bridge**

Create, translate, and manage workflows between n8n and Make.com using natural language

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Natural Language to Workflow**: "Create a workflow that reads Gmail and posts to Slack" → Done!
- **MCP Integration**: Works with Claude Desktop for conversational workflow creation
- **Smart Templates**: 6+ pre-built business automation templates
- **30+ Service Integrations**: Microsoft 365, Google Workspace, Salesforce, OpenAI, and more

### 🔄 Workflow Translation
- **Bidirectional**: Convert workflows between n8n ↔ Make.com
- **Intelligent Mapping**: Automatic service and node type mapping
- **Batch Operations**: Translate multiple workflows at once
- **Import & Modify**: Import existing workflows and enhance them with natural language

### 🚀 Multiple Interfaces
- **Interactive CLI**: Simple command-line interface
- **REST API**: Full HTTP API for programmatic access
- **MCP Server**: Claude Desktop integration
- **TypeScript SDK**: Direct code integration

---

## 🚀 Quick Start

### **2-Step Setup:**

```bash
# 1. Install & configure (wizard guides you through API keys)
./install.sh

# 2. Start using it!
./cli.sh          # Interactive CLI
```

### **First Workflow:**

```
💬 > generate "read gmail and summarize with AI, post to slack" --platform n8n --create
```

✅ **Done!** Workflow created in n8n.

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| **[API Keys Cheatsheet](API_KEYS_CHEATSHEET.md)** ⭐ | Copy & paste guide for all API keys |
| [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md) | Detailed step-by-step instructions |
| [Quick Start](QUICK_START.md) | 3-minute setup guide |
| [Examples](EXAMPLES.md) | 15+ real-world workflow examples |
| [Import & Modify](IMPORT_AND_MODIFY.md) | Guide to modifying existing workflows |
| [MCP Setup](MCP_SETUP.md) | Claude Desktop integration |
| [Quick Reference](QUICK_REFERENCE.md) | All commands at a glance |

---

## 🔌 Supported Services (30+)

<table>
<tr>
<td>

**AI & ML**
- OpenAI (GPT-4, DALL-E)
- Anthropic Claude

**Microsoft 365**
- Outlook
- Teams
- Excel
- OneDrive
- SharePoint

</td>
<td>

**Google Workspace**
- Gmail
- Sheets
- Drive
- Calendar

**Communication**
- Slack
- Discord
- Twilio

</td>
<td>

**Business**
- Salesforce
- HubSpot
- Shopify
- QuickBooks
- Stripe

**Productivity**
- Notion
- Airtable
- Asana
- Trello

</td>
</tr>
</table>

[See complete list →](src/types/businessApis.ts)

---

## 💡 Examples

### Generate New Workflow

```bash
./cli.sh
```

```
💬 > generate "daily email summary with AI to slack #work-digest" --platform n8n --create
```

### Import and Enhance Existing Workflow

```
💬 > import workflow-abc123 --from n8n
💬 > modify workflow-abc123 "add slack notification on errors" --platform n8n --update
```

### Translate Between Platforms

```
💬 > translate workflow-abc123 --from n8n --to make --create
```

### Use Pre-built Templates

```
💬 > templates email
💬 > generate "email automation template for AI summaries" --platform n8n --create
```

[See 15+ More Examples →](EXAMPLES.md)

---

## 🛠️ Usage Modes

### 1. Interactive CLI (Easiest)

```bash
./cli.sh
```

Commands:
- `generate "<description>" --platform n8n --create`
- `import <id> --from n8n`
- `modify <id> "<changes>" --platform n8n --update`
- `translate <id> --from n8n --to make --create`
- `list --platform n8n`
- `templates [keyword]`
- `services [keyword]`

### 2. REST API

```bash
./start.sh api
```

```bash
# Generate workflow
curl -X POST http://localhost:3000/api/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Send daily reports to Slack",
    "platform": "n8n",
    "createWorkflow": true
  }'
```

### 3. MCP Server (Claude Desktop)

```bash
./start.sh mcp
```

Then talk to Claude naturally:
```
"Create a workflow that processes expense receipts from email
and creates QuickBooks entries"
```

### 4. TypeScript/JavaScript

```typescript
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';

const generator = new WorkflowGeneratorAgent();
const result = await generator.generateFromDescription(
  'Send daily email summaries to Slack',
  'n8n'
);
```

---

## 📋 Prerequisites

- Node.js 18+
- n8n instance (local or cloud)
- Make.com account (free tier works!)
- (Optional) Claude Desktop for MCP
- (Optional) OpenAI/Anthropic API keys

---

## ⚙️ Installation

### Option 1: Quick Install (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/n8n-make-bridge.git
cd n8n-make-bridge

# Run installer (includes configuration wizard)
./install.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install --no-bin-links

# Build project
npm run build

# Configure (interactive wizard)
./configure.sh
```

### Option 3: Manual Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

[See Complete Setup Guide →](COMPLETE_SETUP_GUIDE.md)

---

## 🔑 Getting API Keys

### n8n API Key

1. Open n8n (http://localhost:5678)
2. Settings → API → Create API Key
3. Copy the key

### Make.com API Token

1. Log in to [Make.com](https://www.make.com)
2. Profile → API → Add Token
3. Copy the token

[Complete API Keys Guide →](API_KEYS_CHEATSHEET.md)

---

## 🎯 Use Cases

### Business Automation
- 📧 **Email Management**: AI-powered email summarization and routing
- 💰 **Expense Tracking**: Automated receipt processing and QuickBooks integration
- 🎫 **Support Tickets**: Auto-categorization and routing
- 📊 **Reporting**: Automated daily/weekly business reports

### CRM & Sales
- 🎯 **Lead Enrichment**: Automatic lead data enhancement
- 👥 **Customer Onboarding**: Multi-step welcome sequences
- 📈 **Sales Automation**: Deal creation and notification flows

### Development & Operations
- 🚨 **Error Monitoring**: Alert workflows for system issues
- 🔄 **Data Sync**: Keep systems synchronized
- 📦 **Backup Automation**: Scheduled data backups

[See Real Examples →](EXAMPLES.md)

---

## 🏗️ Architecture

```
src/
├── clients/         # API clients for n8n and Make.com
│   ├── n8nClient.ts
│   └── makeClient.ts
├── agents/          # AI-powered workflow agents
│   ├── makeToN8nAgent.ts
│   ├── n8nToMakeAgent.ts
│   ├── workflowGeneratorAgent.ts
│   └── workflowModifierAgent.ts
├── templates/       # Pre-built workflow templates
│   └── workflowTemplates.ts
├── types/          # TypeScript types and service mappings
│   ├── index.ts
│   └── businessApis.ts
├── mcp/            # MCP server for Claude Desktop
│   └── server.ts
├── api/            # REST API server
│   └── server.ts
└── cli.ts          # Interactive CLI
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Add New Service Integrations

Edit `src/types/businessApis.ts`:

```typescript
'your_service': {
  name: 'Your Service',
  n8nNodeType: 'n8n-nodes-base.yourService',
  makeModuleType: 'yourservice',
  category: 'productivity',
  commonOperations: ['create', 'read', 'update'],
}
```

### Add Workflow Templates

Edit `src/templates/workflowTemplates.ts`:

```typescript
{
  id: 'your_template',
  name: 'Your Template Name',
  description: 'What it does',
  category: 'business',
  keywords: ['email', 'automation'],
  requiredServices: ['gmail', 'slack'],
  n8nTemplate: { /* workflow definition */ }
}
```

### Submit Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [n8n](https://n8n.io/) - Workflow automation platform
- [Make.com](https://www.make.com/) - Integration platform
- [Anthropic](https://www.anthropic.com/) - Claude AI and MCP
- [OpenAI](https://openai.com/) - GPT models

---

## 📬 Support

- 📖 [Documentation](COMPLETE_SETUP_GUIDE.md)
- 💬 [Issues](https://github.com/yourusername/n8n-make-bridge/issues)
- 🌟 [Star this repo](https://github.com/yourusername/n8n-make-bridge)

---

## 🚀 Quick Command Reference

```bash
# Setup
./install.sh              # Install & configure
./configure.sh            # Reconfigure API keys

# Run
./cli.sh                  # Interactive CLI
./start.sh api            # REST API server
./start.sh mcp            # MCP server

# Development
npm run dev               # Dev mode - API
npm run dev:cli           # Dev mode - CLI
npm run dev:mcp           # Dev mode - MCP
npm run build             # Build project
```

---

<div align="center">

**Built with ❤️ for the automation community**

[⭐ Star on GitHub](https://github.com/yourusername/n8n-make-bridge) • [📖 Read the Docs](COMPLETE_SETUP_GUIDE.md) • [🐛 Report Bug](https://github.com/yourusername/n8n-make-bridge/issues)

</div>
