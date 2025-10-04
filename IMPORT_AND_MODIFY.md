# Import and Modify Existing Workflows

This guide shows you how to import existing workflows from n8n or Make.com and modify them using natural language.

## Table of Contents

1. [Quick Examples](#quick-examples)
2. [Using MCP with Claude](#using-mcp-with-claude)
3. [Using the REST API](#using-the-rest-api)
4. [Using Code](#using-code)
5. [Modification Operations](#modification-operations)
6. [Real-World Scenarios](#real-world-scenarios)

---

## Quick Examples

### Example 1: Add a Notification Step

**With Claude (MCP):**
```
You: "Import my n8n workflow #abc123 and add a Slack notification
at the end that posts to #alerts. Update it."

Claude: ✅ Imported workflow "Email Processor"
        ✅ Added Slack node at the end
        ✅ Updated workflow in n8n
        Done!
```

### Example 2: Remove Unnecessary Steps

**With Claude (MCP):**
```
You: "Get my Make scenario #456 and remove the delay module.
Don't update it yet, just show me what it would look like."

Claude: ✅ Imported scenario "Order Processing"
        ✅ Removed delay module
        Here's the modified version...
```

### Example 3: Enhance with AI

**With Claude (MCP):**
```
You: "Take workflow #xyz789 from n8n and add an OpenAI step
after the Gmail trigger to categorize emails by urgency."

Claude: ✅ Imported workflow
        ✅ Added OpenAI categorization step
        Want me to update it?
```

---

## Using MCP with Claude

### Setup

First, ensure your MCP server is configured (see [MCP_SETUP.md](MCP_SETUP.md)).

### Basic Workflow

1. **Ask Claude to import and modify:**

```
"Import workflow #123 from n8n and [your modifications]"
```

2. **Claude will:**
   - Fetch the workflow
   - Apply your modifications
   - Show you the changes
   - Ask if you want to update it

3. **Approve or request changes:**

```
"Yes, update it"
or
"Actually, also add [additional changes]"
```

### Supported Modifications

**Add Steps:**
```
"Add a Slack notification at the end"
"Insert a data transformation step after the trigger"
"Add OpenAI summarization before sending the email"
```

**Remove Steps:**
```
"Remove the delay node"
"Delete the HTTP Request step"
"Remove all email nodes"
```

**Modify Steps:**
```
"Change the Slack channel to #general"
"Update the email subject to 'Daily Report'"
"Modify the OpenAI prompt to be more concise"
```

**Rename:**
```
"Rename this workflow to 'Production Email Handler'"
```

**Activate/Deactivate:**
```
"Activate this workflow"
"Disable this scenario"
```

---

## Using the REST API

### Import and Modify Endpoint

```bash
POST /api/modify-workflow
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/modify-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "abc123",
    "platform": "n8n",
    "instructions": "Add a Slack notification step at the end that posts to #alerts",
    "updateWorkflow": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow modified and updated",
  "original": {
    "name": "Email Processor",
    "nodes": 3
  },
  "modified": {
    "name": "Email Processor",
    "nodes": 4
  },
  "changes": [
    "Added Slack node at position 3"
  ]
}
```

### Import Only (No Modifications)

```bash
GET /api/workflow/:platform/:id
```

**Example:**
```bash
curl http://localhost:3000/api/workflow/n8n/abc123
```

---

## Using Code

### TypeScript/JavaScript

```typescript
import { N8nClient } from './clients/n8nClient';
import { WorkflowModifierAgent } from './agents/workflowModifierAgent';

// Initialize clients
const n8nClient = new N8nClient(
  process.env.N8N_BASE_URL!,
  process.env.N8N_API_KEY!
);

const modifier = new WorkflowModifierAgent();

// Import workflow
const workflow = await n8nClient.getWorkflow('abc123');
console.log(`Imported: ${workflow.name}`);
console.log(`Current nodes: ${workflow.nodes.length}`);

// Modify it
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Add a Slack notification at the end'
);

if (result.success) {
  console.log('Modified successfully');

  // Update in n8n
  await n8nClient.updateWorkflow('abc123', result.data);
  console.log('Updated in n8n');
}
```

### Advanced: Multiple Modifications

```typescript
// Import workflow
const workflow = await n8nClient.getWorkflow('abc123');

// Apply multiple modifications
let modified = workflow;

// 1. Add Slack notification
let result = await modifier.modifyN8nWorkflow(
  modified,
  'Add Slack notification at the end'
);
modified = result.data;

// 2. Add AI processing
result = await modifier.modifyN8nWorkflow(
  modified,
  'Add OpenAI step after the trigger to analyze content'
);
modified = result.data;

// 3. Rename
result = await modifier.modifyN8nWorkflow(
  modified,
  'Rename to "Enhanced Email Processor"'
);

// Update
await n8nClient.updateWorkflow('abc123', result.data);
```

---

## Modification Operations

### Add Nodes

The modifier understands various ways to add nodes:

**At the End (Default):**
```
"Add a Slack notification"
"Add OpenAI step"
"Insert a Google Sheets node"
```

**At Specific Positions:**
```
"Add a delay at the beginning"
"Insert HTTP request in the middle"
"Add error handler before the Slack node"
```

**With Configuration:**
```
"Add Slack notification to #alerts channel"
"Add OpenAI with GPT-4 model"
"Insert Gmail send with subject 'Daily Report'"
```

### Remove Nodes

```
"Remove the Slack node"
"Delete all delay steps"
"Remove the HTTP request"
```

### Modify Nodes

```
"Change the Slack channel to #general"
"Update the OpenAI model to GPT-4"
"Modify the email recipient to admin@company.com"
```

### Workflow-Level Changes

```
"Rename to 'Production Handler'"
"Activate this workflow"
"Deactivate this workflow"
```

---

## Real-World Scenarios

### Scenario 1: Adding Error Handling

**Before:**
```
Gmail Trigger → Process Data → Send Email
```

**Task:**
```
"Add error handling: if the process fails, send an alert to Slack"
```

**After:**
```
Gmail Trigger → Process Data → Send Email
                      ↓ (on error)
                 Slack Alert
```

**Claude Command:**
```
"Import workflow #123 from n8n and add error handling.
If the process step fails, send a Slack alert to #errors."
```

---

### Scenario 2: Enhancing with AI

**Before:**
```
Form Submission → Save to Airtable
```

**Task:**
```
"Use AI to categorize submissions before saving"
```

**After:**
```
Form Submission → OpenAI Categorization → Save to Airtable (with category)
```

**Claude Command:**
```
"Import my n8n workflow 'Form Handler' and add an OpenAI step
after the form trigger to categorize the submission into
'Sales', 'Support', or 'General'. Pass the category to Airtable."
```

---

### Scenario 3: Converting to Multi-Channel

**Before:**
```
Schedule → Fetch Data → Email Report
```

**Task:**
```
"Send to both email and Slack"
```

**After:**
```
Schedule → Fetch Data → ├→ Email Report
                        └→ Slack Report (#reports)
```

**Claude Command:**
```
"Import workflow #456 and modify it to send the report
to both email AND Slack channel #reports"
```

---

### Scenario 4: Adding Approval Step

**Before:**
```
New Lead → Auto-Create Deal in CRM
```

**Task:**
```
"Add manual approval before creating deal"
```

**After:**
```
New Lead → Slack Approval Request → (if approved) → Create Deal
```

**Claude Command:**
```
"Import my Make scenario 'Lead Handler' and add a manual approval
step via Slack before creating the deal. Send approval request to
#sales-approvals channel."
```

---

### Scenario 5: Batch Import and Standardize

**Task:** Import all workflows and add consistent error logging

```typescript
// Get all workflows
const workflows = await n8nClient.getWorkflows();

// Add Slack error notification to each
for (const workflow of workflows) {
  const result = await modifier.modifyN8nWorkflow(
    workflow,
    'Add Slack notification on error to #workflow-errors'
  );

  if (result.success) {
    await n8nClient.updateWorkflow(workflow.id!, result.data);
    console.log(`✅ Updated: ${workflow.name}`);
  }
}
```

---

## Tips and Best Practices

### 1. Preview Before Updating

Always preview changes first:
```
"Import workflow #123 and add Slack notification.
DON'T update it yet, just show me."
```

Then:
```
"Looks good, update it now"
```

### 2. Be Specific with Services

```
✅ Good: "Add a Slack notification to #alerts"
❌ Vague: "Add a notification"
```

### 3. Specify Positions

```
✅ "Add delay at the beginning"
✅ "Insert OpenAI after the Gmail trigger"
❌ "Add delay somewhere"
```

### 4. Combine Multiple Changes

```
"Import workflow #123 and:
1. Add Slack notification at the end
2. Rename to 'Production Email Handler'
3. Activate it
Then update it."
```

### 5. Test Modifications

```
// Import
const workflow = await n8nClient.getWorkflow('test-123');

// Modify
const result = await modifier.modifyN8nWorkflow(
  workflow,
  'Add test step'
);

// Save as new workflow first (don't overwrite)
const newWorkflow = await n8nClient.createWorkflow({
  ...result.data,
  name: `${result.data.name} (Modified)`
});

// Test the new one, then update original if it works
```

---

## Troubleshooting

### "Node not found"

**Problem:** Modifier can't find the node you're referencing

**Solution:** Be more specific:
```
❌ "Remove the node"
✅ "Remove the Slack node"
✅ "Remove the OpenAI step"
```

### "Could not determine action"

**Problem:** Instructions are ambiguous

**Solution:** Use clear action verbs:
```
❌ "Do something with Slack"
✅ "Add a Slack notification"
✅ "Remove the Slack node"
✅ "Modify the Slack channel to #general"
```

### Position Issues

**Problem:** Node added in wrong position

**Solution:** Specify position explicitly:
```
"Add Slack notification at the end"
"Insert delay at the beginning"
"Add OpenAI step after the Gmail trigger"
```

---

## Workflow Modification API Reference

### MCP Tool: `modify_workflow`

**Parameters:**
- `workflowId` (required): Workflow or scenario ID
- `platform` (required): "n8n" or "make"
- `instructions` (required): Natural language modification instructions
- `updateWorkflow` (optional): Boolean, whether to update immediately

**Example:**
```javascript
{
  "workflowId": "abc123",
  "platform": "n8n",
  "instructions": "Add Slack notification at the end",
  "updateWorkflow": true
}
```

---

## Next Steps

1. ✅ Try importing and modifying a workflow
2. 📝 Experiment with different modification types
3. 🔄 Combine import + modify + translate workflows
4. 🚀 Automate bulk modifications across workflows

For more examples, see [EXAMPLES.md](EXAMPLES.md).
