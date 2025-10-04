# Getting Started Guide

Welcome to the n8n-Make.com Bridge! This guide will help you get up and running quickly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage Options](#usage-options)
5. [Your First Workflow](#your-first-workflow)
6. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ An n8n instance (local or cloud)
- ✅ A Make.com account
- ✅ (Optional) Claude Desktop for MCP integration

### Getting n8n

**Option 1: Docker**
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

**Option 2: npm**
```bash
npm install n8n -g
n8n start
```

**Option 3: n8n Cloud**
Sign up at [n8n.cloud](https://n8n.cloud)

### Getting Make.com Access

Sign up for a free account at [make.com](https://www.make.com/)

---

## Installation

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd n8n.make.io

# Install dependencies (use --no-bin-links on Windows/WSL)
npm install --no-bin-links

# Build the project
npm run build
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:
```env
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_key_here

# Make.com Configuration
MAKE_API_TOKEN=your_token_here
MAKE_REGION=eu1  # or us1, us2, etc.

# Server Configuration
PORT=3000
```

---

## Configuration

### Get Your n8n API Key

1. Open n8n (http://localhost:5678)
2. Click your profile → **Settings**
3. Navigate to **API** section
4. Click **Create API Key**
5. Copy the key to `.env`

![n8n API Key](https://docs.n8n.io/assets/images/api-key.png)

### Get Your Make.com API Token

1. Log in to Make.com
2. Go to your profile (top right)
3. Click **API**
4. Click **Add Token**
5. Give it a name and create
6. Copy the token to `.env`

### Verify Configuration

```bash
# Test n8n connection
curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows

# Test Make connection
curl -H "Authorization: Token your_token" https://eu1.make.com/api/v2/scenarios
```

---

## Usage Options

You have three ways to use the bridge:

### 🌟 Option 1: MCP Server with Claude (Easiest!)

**Best for**: Non-developers, natural language workflow creation

1. **Install Claude Desktop**: [Download here](https://claude.ai/download)

2. **Configure MCP** (see [MCP_SETUP.md](MCP_SETUP.md)):

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "n8n-make-bridge": {
      "command": "node",
      "args": ["/absolute/path/to/n8n.make.io/dist/mcp/server.js"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your_n8n_key",
        "MAKE_API_TOKEN": "your_make_token"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Start creating**:
```
You: "Create a workflow that summarizes my emails"
Claude: [Uses MCP tools to generate workflow]
```

### 🚀 Option 2: REST API (For Developers)

**Best for**: Programmatic access, integrations, custom tools

```bash
# Start the server
npm run dev
# Server runs on http://localhost:3000
```

**Example API Call**:
```bash
curl -X POST http://localhost:3000/translate/make-to-n8n/batch \
  -H "Content-Type: application/json" \
  -d '{
    "createWorkflows": true,
    "teamId": "your-team-id"
  }'
```

### 💻 Option 3: TypeScript/JavaScript (For Automation)

**Best for**: Custom scripts, CI/CD, advanced automation

```typescript
import { N8nClient } from './clients/n8nClient';
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';

const n8nClient = new N8nClient(
  process.env.N8N_BASE_URL!,
  process.env.N8N_API_KEY!
);

const generator = new WorkflowGeneratorAgent();
const result = await generator.generateFromDescription(
  'Send daily email summaries to Slack',
  'n8n'
);

if (result.success) {
  await n8nClient.createWorkflow(result.data);
}
```

---

## Your First Workflow

Let's create a simple workflow that demonstrates the power of the bridge.

### Example: Email AI Summarizer

**Goal**: Automatically summarize important emails and post to Slack

#### Using MCP (Claude Desktop):

```
You: "Create a workflow in n8n that:
1. Watches for new emails in Gmail with the label 'Important'
2. Summarizes each email using OpenAI GPT-4
3. Posts the summary to Slack channel #email-digest

Make it and activate it."

Claude: [Generates and creates the workflow automatically]
```

#### Using REST API:

```bash
curl -X POST http://localhost:3000/translate/make-to-n8n/batch \
  -H "Content-Type: application/json" \
  -d '{
    "createWorkflows": true,
    "templateId": "email_ai_summary"
  }'
```

#### Using Code:

```typescript
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';
import { N8nClient } from './clients/n8nClient';

const generator = new WorkflowGeneratorAgent();
const n8nClient = new N8nClient(
  process.env.N8N_BASE_URL!,
  process.env.N8N_API_KEY!
);

// Generate from template
const result = await generator.generateFromTemplate(
  'email_ai_summary',
  'n8n',
  {
    slackChannel: '#email-digest',
    gmailLabel: 'Important'
  }
);

// Create in n8n
if (result.success && result.data) {
  const workflow = await n8nClient.createWorkflow(result.data);
  console.log(`Created workflow: ${workflow.id}`);

  // Activate it
  await n8nClient.activateWorkflow(workflow.id!);
  console.log('Workflow activated!');
}
```

---

## Next Steps

### 📚 Learn More

1. **Explore Templates**: Check out [EXAMPLES.md](EXAMPLES.md) for 15+ ready-to-use workflows
2. **MCP Deep Dive**: Read [MCP_SETUP.md](MCP_SETUP.md) for advanced MCP configuration
3. **API Reference**: See [README.md](README.md#api-endpoints) for complete API docs

### 🔧 Customize

1. **Add Your Own Templates**:
   - Edit `src/templates/workflowTemplates.ts`
   - Add your common workflows

2. **Add New Services**:
   - Edit `src/types/businessApis.ts`
   - Map new APIs to n8n/Make nodes

3. **Extend Agents**:
   - Modify `src/agents/workflowGeneratorAgent.ts`
   - Add custom generation logic

### 🚀 Advanced Use Cases

- **Migrate Entire Organization**: Batch translate all workflows
- **Keep Platforms in Sync**: Set up bidirectional sync
- **Custom Business Logic**: Build workflows programmatically
- **CI/CD Integration**: Deploy workflows automatically

### 🤝 Get Help

- **Issues**: Found a bug? [Open an issue](https://github.com/yourrepo/issues)
- **Discussions**: Have questions? [Start a discussion](https://github.com/yourrepo/discussions)
- **Examples**: Need inspiration? See [EXAMPLES.md](EXAMPLES.md)

---

## Troubleshooting

### Common Issues

**"Cannot connect to n8n"**
```bash
# Check n8n is running
curl http://localhost:5678

# Verify API key
curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows
```

**"Make.com API error"**
```bash
# Verify token and region
curl -H "Authorization: Token your_token" https://eu1.make.com/api/v2/scenarios

# Try different region (us1, us2, etc.)
```

**"MCP server not showing up in Claude"**
- Ensure path in config is absolute
- Restart Claude Desktop completely
- Check Node.js is in PATH
- Verify project is built (`npm run build`)

**"Permission errors on Windows"**
```bash
# Use --no-bin-links flag
npm install --no-bin-links
```

---

## Quick Reference

### Commands

```bash
# Development
npm run dev              # Run REST API server
npm run dev:mcp          # Run MCP server

# Production
npm run build            # Build project
npm start                # Run REST API
npm run start:mcp        # Run MCP server

# Testing
curl http://localhost:3000/health  # Check API health
```

### File Locations

```
.env                     # Your configuration
src/templates/           # Workflow templates
src/types/businessApis.ts  # Service mappings
src/mcp/server.ts        # MCP server
src/api/server.ts        # REST API
```

---

## What's Next?

Now that you're set up, here are some ideas:

1. ✅ **Create your first workflow** using the examples above
2. 🔄 **Migrate existing workflows** between platforms
3. 🤖 **Experiment with AI generation** through MCP
4. 📊 **Build business automations** from templates
5. 🛠️ **Customize and extend** for your needs

Happy automating! 🎉
