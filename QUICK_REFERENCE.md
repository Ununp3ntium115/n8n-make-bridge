# Quick Reference Guide

Everything you can do with the n8n-Make Bridge in one place.

## 🎯 Main Use Cases

| What You Want | How To Do It |
|---------------|-------------|
| **Generate new workflow** | Talk to Claude: "Create a workflow that..." |
| **Import and modify existing** | "Import workflow #123 and add..." |
| **Translate between platforms** | "Convert my n8n workflow to Make" |
| **Find templates** | "Show me email automation templates" |
| **Search services** | "What Microsoft services are available?" |

---

## 💬 Claude Desktop Commands (MCP)

### Generate New Workflows

```
"Create a workflow that reads Gmail, summarizes with AI,
and posts to Slack"

"Build an expense automation that processes receipts
from email and creates QuickBooks entries"

"Make a CRM lead enrichment workflow for Salesforce"
```

### Import and Modify Existing

```
"Import my n8n workflow #abc123"

"Get workflow #123 from n8n and add a Slack notification
at the end"

"Import Make scenario #456 and remove the delay step"

"Take workflow #xyz and add OpenAI categorization
after the email trigger, then update it"
```

### Translate Between Platforms

```
"Convert my n8n workflow #123 to Make.com"

"Translate all my Make scenarios to n8n"

"Move workflow #456 from Make to n8n and create it"
```

### Search and Discover

```
"Show me templates for email automation"

"What CRM integrations are available?"

"Find templates that use OpenAI"

"List all my n8n workflows"
```

### Workflow Management

```
"Show me workflow #123 details"

"Activate workflow #456"

"Rename workflow #789 to 'Production Email Handler'"

"List all my Make scenarios"
```

---

## 🚀 REST API Endpoints

### Generate Workflows

```bash
POST /api/generate-workflow
{
  "description": "Summarize emails and post to Slack",
  "platform": "n8n",
  "createWorkflow": true
}
```

### Import and Modify

```bash
POST /api/modify-workflow
{
  "workflowId": "abc123",
  "platform": "n8n",
  "instructions": "Add Slack notification at the end",
  "updateWorkflow": true
}
```

### Translate Workflows

```bash
# Single workflow
POST /translate/n8n-to-make/:workflowId
{
  "createScenario": true
}

# Batch translation
POST /translate/make-to-n8n/batch
{
  "teamId": "...",
  "createWorkflows": true
}
```

### Get Workflows

```bash
# List all
GET /n8n/workflows
GET /make/scenarios

# Get specific
GET /n8n/workflows/:id
GET /make/scenarios/:id
```

---

## 💻 TypeScript/JavaScript Code

### Generate New Workflow

```typescript
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';
import { N8nClient } from './clients/n8nClient';

const generator = new WorkflowGeneratorAgent();
const n8nClient = new N8nClient(
  process.env.N8N_BASE_URL!,
  process.env.N8N_API_KEY!
);

// Generate
const result = await generator.generateFromDescription(
  'Send daily email summaries to Slack',
  'n8n'
);

// Create
if (result.success) {
  const workflow = await n8nClient.createWorkflow(result.data);
  console.log(`Created: ${workflow.id}`);
}
```

### Import and Modify

```typescript
import { WorkflowModifierAgent } from './agents/workflowModifierAgent';

const modifier = new WorkflowModifierAgent();

// Import
const workflow = await n8nClient.getWorkflow('abc123');

// Modify
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Add Slack notification at the end'
);

// Update
if (result.success) {
  await n8nClient.updateWorkflow('abc123', result.data);
}
```

### Translate Between Platforms

```typescript
import { N8nToMakeAgent } from './agents/n8nToMakeAgent';
import { MakeClient } from './clients/makeClient';

const translator = new N8nToMakeAgent();
const makeClient = new MakeClient(process.env.MAKE_API_TOKEN!);

// Get n8n workflow
const workflow = await n8nClient.getWorkflow('abc123');

// Translate to Make
const result = await translator.translate(workflow);

// Create in Make
if (result.success) {
  const scenario = await makeClient.createScenario(result.data);
  console.log(`Created Make scenario: ${scenario.id}`);
}
```

### Use Templates

```typescript
const result = await generator.generateFromTemplate(
  'email_ai_summary',
  'n8n',
  {
    slackChannel: '#my-channel',
    gmailLabel: 'Important'
  }
);
```

---

## 🔌 Available Services

### AI
- OpenAI (GPT-4, DALL-E, Whisper)
- Anthropic Claude

### Microsoft 365
- Outlook, Teams, Excel, OneDrive, SharePoint

### Google Workspace
- Gmail, Sheets, Drive, Calendar

### CRM & Sales
- Salesforce, HubSpot

### Communication
- Slack, Discord, Twilio

### E-commerce
- Shopify, WooCommerce

### Finance
- QuickBooks, Stripe

### Productivity
- Notion, Airtable, Asana, Trello

### Databases
- PostgreSQL, MySQL, MongoDB

### Development
- GitHub, GitLab

### Storage
- Dropbox, AWS S3

**[Full list in businessApis.ts](src/types/businessApis.ts)**

---

## 📋 Pre-Built Templates

| Template ID | Description |
|-------------|-------------|
| `email_ai_summary` | AI email summarizer → Slack |
| `crm_lead_enrichment` | Enrich Salesforce leads |
| `expense_automation` | Process receipts → QuickBooks |
| `customer_onboarding` | Shopify → HubSpot → Email |
| `social_media_content` | AI content generator |
| `invoice_processing` | Email invoices → QuickBooks |

---

## 🛠️ Common Operations

### Add Step to Existing Workflow

**Claude:**
```
"Import workflow #123 and add Slack notification at the end"
```

**Code:**
```typescript
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Add Slack notification at the end'
);
```

### Remove Step

**Claude:**
```
"Import workflow #123 and remove the delay step"
```

**Code:**
```typescript
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Remove the delay node'
);
```

### Enhance with AI

**Claude:**
```
"Import workflow #123 and add OpenAI step after the trigger
to categorize content"
```

**Code:**
```typescript
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Add OpenAI step after trigger to categorize'
);
```

### Batch Operations

**Translate all workflows:**
```bash
POST /translate/n8n-to-make/batch
{
  "createScenarios": true
}
```

**Code:**
```typescript
const workflows = await n8nClient.getWorkflows();
const translator = new N8nToMakeAgent();

for (const workflow of workflows) {
  const result = await translator.translate(workflow);
  if (result.success) {
    await makeClient.createScenario(result.data);
  }
}
```

---

## 🎓 Learning Path

### 1. Start with MCP (Easiest)
- Set up Claude Desktop
- Try: "Create a simple email to Slack workflow"
- Experiment with modifications

### 2. Explore Templates
- "Show me email automation templates"
- Use pre-built workflows
- Customize them: "Use the email summarizer but post to Teams"

### 3. Import and Modify
- "Import my workflow #123"
- "Add Slack notification"
- "Remove the delay step"

### 4. Advanced: Use Code
- Import workflows programmatically
- Batch modifications
- Custom generation logic

---

## 📚 Documentation

| Document | What's In It |
|----------|-------------|
| [README.md](README.md) | Main overview, installation, API docs |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Step-by-step setup guide |
| [MCP_SETUP.md](MCP_SETUP.md) | Claude Desktop MCP configuration |
| [EXAMPLES.md](EXAMPLES.md) | 15+ real-world workflow examples |
| [IMPORT_AND_MODIFY.md](IMPORT_AND_MODIFY.md) | Importing and modifying workflows |
| **QUICK_REFERENCE.md** | This document - everything at a glance |

---

## ⚡ Quick Setup

```bash
# 1. Install
npm install --no-bin-links

# 2. Configure
cp .env.example .env
# Edit .env with your API keys

# 3. Build
npm run build

# 4a. Run REST API
npm run dev

# 4b. OR Run MCP Server
npm run dev:mcp
```

---

## 🔥 Most Common Commands

### Top 5 Claude Commands

1. **Generate workflow:**
   ```
   "Create a workflow that [does something]"
   ```

2. **Import and add step:**
   ```
   "Import workflow #123 and add [service] at the end"
   ```

3. **Search templates:**
   ```
   "Show me templates for [use case]"
   ```

4. **Translate:**
   ```
   "Convert my n8n workflow #123 to Make"
   ```

5. **List workflows:**
   ```
   "Show me all my n8n workflows"
   ```

---

## 🆘 Common Issues

**Can't connect to n8n/Make:**
- Check `.env` has correct URLs and keys
- Verify n8n is running: `curl http://localhost:5678`

**MCP not showing in Claude:**
- Use absolute path in config
- Restart Claude Desktop
- Check `npm run build` was run

**Modifications not working:**
- Be specific: "Add Slack" not "Add notification"
- Specify position: "at the end" or "after trigger"
- Preview first: "Don't update, just show me"

---

## 💡 Pro Tips

1. **Preview before updating**
   ```
   "Import #123 and add Slack. Don't update yet."
   ```

2. **Batch similar workflows**
   ```typescript
   // Add error logging to all workflows
   for (const wf of workflows) {
     await modifier.modifyN8nWorkflow(wf, 'Add error logging');
   }
   ```

3. **Use templates as starting points**
   ```
   "Use the email summarizer template but send to Teams instead"
   ```

4. **Combine operations**
   ```
   "Import #123, add Slack notification, rename to 'Production',
   and activate it"
   ```

5. **Test before production**
   ```
   "Create this workflow but don't activate it yet"
   ```

---

## 🚀 Next Steps

- [ ] Set up MCP with Claude Desktop
- [ ] Try generating your first workflow
- [ ] Import and modify an existing workflow
- [ ] Explore the template library
- [ ] Customize for your business needs

Happy automating! 🎉
