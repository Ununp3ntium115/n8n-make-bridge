# MCP Server Setup Guide

This guide explains how to use the n8n-Make Bridge as an MCP (Model Context Protocol) server with Claude Desktop or other AI assistants.

## What is MCP?

Model Context Protocol (MCP) is an open standard by Anthropic that enables AI assistants to securely connect to external tools and data sources. With MCP, Claude can directly generate, translate, and manage workflows in n8n and Make.com.

## Features

With the MCP server, you can ask Claude to:

✅ **Generate workflows from natural language**
```
"Create a workflow that summarizes my emails and sends them to Slack"
```

✅ **Translate workflows between platforms**
```
"Convert my n8n workflow #123 to Make.com"
```

✅ **Search for templates and services**
```
"Show me templates for CRM automation"
```

✅ **Create business automations**
```
"Set up expense report automation with QuickBooks"
```

## Installation

### 1. Build the Project

```bash
npm run build
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
MAKE_API_TOKEN=your_make_token
MAKE_REGION=eu1
```

### 3. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the MCP server configuration:

```json
{
  "mcpServers": {
    "n8n-make-bridge": {
      "command": "node",
      "args": [
        "/absolute/path/to/n8n.make.io/dist/mcp/server.js"
      ],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your_n8n_api_key",
        "MAKE_API_TOKEN": "your_make_token",
        "MAKE_REGION": "eu1"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

Close and reopen Claude Desktop. The MCP server should now be available.

## Available Tools

### 1. `generate_workflow`

Generate a workflow from natural language description.

**Example Usage in Claude**:
```
Create a workflow that:
1. Watches for new emails in Gmail
2. Summarizes them with AI
3. Posts summaries to Slack #email-digest channel

Generate this for n8n and create it.
```

**Parameters**:
- `description` (required): Natural language description
- `platform` (required): "n8n" or "make"
- `createWorkflow` (optional): true to create immediately

### 2. `translate_workflow`

Translate workflows between n8n and Make.com.

**Example Usage**:
```
Translate my n8n workflow ID abc123 to Make.com and create it
```

**Parameters**:
- `workflowId` (required): ID of workflow to translate
- `sourcePlatform` (required): "n8n" or "make"
- `targetPlatform` (required): "n8n" or "make"
- `createWorkflow` (optional): true to create on target platform

### 3. `search_templates`

Find pre-built workflow templates.

**Example Usage**:
```
Show me templates for email automation with AI
```

**Parameters**:
- `query` (required): Search keywords

### 4. `search_services`

Find available API integrations.

**Example Usage**:
```
What Microsoft services can I use in workflows?
```

**Parameters**:
- `keyword` (required): Service name or category

### 5. `list_workflows`

List all workflows from a platform.

**Example Usage**:
```
Show me all my n8n workflows
```

**Parameters**:
- `platform` (required): "n8n" or "make"

### 6. `get_workflow`

Get details of a specific workflow.

**Example Usage**:
```
Show me the details of n8n workflow xyz789
```

**Parameters**:
- `workflowId` (required): Workflow ID
- `platform` (required): "n8n" or "make"

### 7. `create_business_automation`

Create common business automations from templates.

**Example Usage**:
```
Set up an email summarizer automation in n8n
```

**Parameters**:
- `automationType` (required): One of:
  - `email_summarizer`
  - `crm_lead_enrichment`
  - `expense_automation`
  - `customer_onboarding`
  - `social_media_content`
  - `invoice_processing`
  - `meeting_scheduler`
  - `data_backup`
  - `report_generation`
- `platform` (required): "n8n" or "make"
- `customizations` (optional): Custom parameters

## Supported Services

The MCP server supports 30+ business APIs including:

### Communication
- Microsoft Outlook, Teams
- Gmail
- Slack, Discord
- Twilio

### AI Services
- OpenAI (GPT-4, DALL-E, Whisper)
- Anthropic Claude

### Productivity
- Microsoft Excel, OneDrive, SharePoint
- Google Sheets, Drive, Calendar
- Notion, Airtable
- Asana, Trello

### CRM & Sales
- Salesforce
- HubSpot

### E-commerce
- Shopify
- WooCommerce

### Finance
- QuickBooks
- Stripe

### Databases
- PostgreSQL
- MySQL
- MongoDB

### Development
- GitHub
- GitLab

## Example Conversations

### Example 1: Email AI Summary

**You**: "I want to automatically summarize my important emails each morning and send them to my Slack channel. Can you create this in n8n?"

**Claude** (using MCP tools):
1. Uses `search_templates` to find email automation templates
2. Uses `generate_workflow` with the description
3. Returns the generated workflow and asks if you want to create it
4. If you confirm, creates it using `createWorkflow: true`

### Example 2: Migrating Workflows

**You**: "I have a Make.com scenario (ID: 12345) that processes invoices. I want to move it to n8n."

**Claude** (using MCP tools):
1. Uses `get_workflow` to fetch the Make scenario
2. Uses `translate_workflow` to convert it to n8n format
3. Shows you the translated workflow
4. Creates it in n8n if you approve

### Example 3: Building Complex Automation

**You**: "Create a workflow that:
- Triggers when a new customer signs up on Shopify
- Creates a contact in HubSpot
- Sends a welcome email via Outlook
- Adds them to our Airtable customer database"

**Claude** (using MCP tools):
1. Uses `search_services` to verify all services are available
2. Uses `generate_workflow` with the multi-step description
3. Generates a complete workflow with all 4 steps properly connected
4. Creates it in your chosen platform

## Troubleshooting

### MCP Server Not Showing Up

1. Check that the path in `claude_desktop_config.json` is absolute and correct
2. Ensure the project is built (`npm run build`)
3. Check that Node.js is in your PATH
4. Restart Claude Desktop completely

### API Errors

1. Verify your `.env` file has correct credentials
2. Test n8n API key: `curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows`
3. Test Make API token: `curl -H "Authorization: Token your_token" https://eu1.make.com/api/v2/scenarios`

### Permission Errors

The MCP server runs with the same permissions as Claude Desktop. Ensure:
1. Node.js is installed and accessible
2. The project directory has read permissions
3. Environment variables are properly set

## Testing the MCP Server

You can test the MCP server directly:

```bash
# Run in development mode
npm run dev:mcp

# Or run the built version
npm run start:mcp
```

The server communicates via stdio, so you won't see output unless connected to an MCP client.

## Advanced Configuration

### Custom Templates

Add your own templates in `src/templates/workflowTemplates.ts`:

```typescript
{
  id: 'my_custom_automation',
  name: 'My Custom Automation',
  description: 'Does something specific for my business',
  category: 'custom',
  keywords: ['custom', 'specific'],
  requiredServices: ['service1', 'service2'],
  n8nTemplate: {
    // Your n8n workflow template
  },
  makeTemplate: {
    // Your Make template
  },
}
```

### Custom Service Mappings

Add new API integrations in `src/types/businessApis.ts`:

```typescript
'my_service': {
  name: 'My Service',
  n8nNodeType: 'n8n-nodes-base.myService',
  makeModuleType: 'myservice',
  category: 'productivity',
  commonOperations: ['create', 'read', 'update'],
}
```

## Security Notes

- API keys are stored in environment variables
- MCP server runs locally on your machine
- No data is sent to external servers except the APIs you configure
- Credentials are never included in translated workflows

## Next Steps

1. ✅ Configure the MCP server with Claude Desktop
2. 🤖 Start asking Claude to create workflows
3. 📚 Explore the available templates and services
4. 🔧 Customize templates for your business needs
5. 🚀 Automate your entire business workflow

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Make.com API Documentation](https://developers.make.com/api-documentation)
- [Claude Desktop](https://claude.ai/download)
