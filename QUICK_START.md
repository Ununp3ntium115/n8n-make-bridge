# Quick Start - Run in 3 Steps

## 🚀 Super Simple Setup

### Step 1: Setup (One Time Only)

```bash
./setup.sh
```

This will:
- ✅ Install all dependencies
- ✅ Build the project
- ✅ Create your `.env` file

### Step 2: Configure API Keys

Edit `.env` file:
```bash
nano .env
# OR
vim .env
# OR open in your editor
```

Add your keys:
```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
MAKE_API_TOKEN=your_make_token_here
```

### Step 3: Run!

Choose how you want to use it:

#### **Option A: Interactive CLI (Easiest!)**

```bash
./cli.sh
```

Then just type what you want:
```
💬 > generate "read gmail and post to slack" --platform n8n --create

💬 > import abc123 --from n8n

💬 > list --platform n8n

💬 > templates email

💬 > services microsoft
```

#### **Option B: REST API Server**

```bash
./start.sh api
```

API runs on `http://localhost:3000`

#### **Option C: MCP Server for Claude Desktop**

```bash
./start.sh mcp
```

Then talk to Claude naturally!

---

## 📝 CLI Commands

Once you run `./cli.sh`, you can use:

### Generate Workflows
```
generate "your workflow description" --platform n8n --create
```

**Examples:**
```
generate "read gmail and summarize with AI" --platform n8n

generate "shopify orders to quickbooks" --platform make --create

generate "daily report from airtable to slack" --platform n8n --create
```

### Import & View
```
import <workflow-id> --from n8n
import <scenario-id> --from make
```

**Example:**
```
import abc123 --from n8n
```

### Modify Workflows
```
modify <id> "your modifications" --platform n8n --update
```

**Examples:**
```
modify abc123 "add slack notification at the end" --platform n8n

modify xyz789 "remove the delay step" --platform n8n --update

modify 456 "change slack channel to #alerts" --platform make --update
```

### Translate Between Platforms
```
translate <id> --from n8n --to make --create
```

**Example:**
```
translate abc123 --from n8n --to make --create
```

### List Workflows
```
list --platform n8n
list --platform make
```

### Search Templates
```
templates
templates email
templates crm
templates ai
```

### Search Services
```
services microsoft
services google
services ai
```

### Help & Exit
```
help
exit
```

---

## 🔄 Shell Script Reference

### Setup (Run Once)
```bash
./setup.sh
```

### Start Modes

**REST API Server:**
```bash
./start.sh api          # Production
./start.sh dev          # Development (auto-reload)
```

**MCP Server:**
```bash
./start.sh mcp          # Production
./start.sh dev:mcp      # Development
```

**Interactive CLI:**
```bash
./cli.sh
```

---

## 💡 Quick Examples

### Example 1: Generate and Create Workflow

```bash
./cli.sh
```

```
💬 > generate "watch gmail, use openai to summarize, post to slack #work" --platform n8n --create
```

Result: ✅ Workflow created in n8n!

### Example 2: Import and Modify

```bash
./cli.sh
```

```
💬 > import abc123 --from n8n
💬 > modify abc123 "add slack alert on error" --platform n8n --update
```

Result: ✅ Workflow modified and updated!

### Example 3: Search and Use Template

```bash
./cli.sh
```

```
💬 > templates expense
💬 > generate "use expense automation template but send to teams" --platform n8n --create
```

Result: ✅ Custom workflow from template!

### Example 4: Platform Migration

```bash
./cli.sh
```

```
💬 > list --platform make
💬 > translate 456 --from make --to n8n --create
```

Result: ✅ Scenario converted to n8n workflow!

---

## 🎯 Common Tasks

### Create Email Automation
```
💬 > generate "gmail important emails to slack #email-digest with AI summary" --platform n8n --create
```

### CRM Integration
```
💬 > generate "new salesforce leads to hubspot with enrichment" --platform n8n --create
```

### Expense Tracking
```
💬 > templates expense
💬 > generate "expense automation with quickbooks" --platform n8n --create
```

### List All Workflows
```
💬 > list --platform n8n
```

### Import and Enhance
```
💬 > import my-workflow-id --from n8n
💬 > modify my-workflow-id "add AI categorization after trigger" --platform n8n --update
```

---

## 🆘 Troubleshooting

**"Command not found: ./setup.sh"**
```bash
chmod +x setup.sh start.sh cli.sh
./setup.sh
```

**"n8n client not configured"**
- Edit `.env` and add your `N8N_API_KEY`
- Make sure n8n is running on `N8N_BASE_URL`

**"Make.com client not configured"**
- Edit `.env` and add your `MAKE_API_TOKEN`

**"Project not built"**
```bash
npm run build
```

---

## 🚀 Next Steps

1. ✅ Run `./setup.sh`
2. ✅ Edit `.env` with your API keys
3. ✅ Run `./cli.sh` for interactive mode
4. ✅ Try: `generate "your first workflow" --platform n8n`
5. ✅ Explore templates: `templates`
6. ✅ List your workflows: `list --platform n8n`

**That's it! You're ready to automate!** 🎉

---

## 📚 More Info

- [Full Documentation](README.md)
- [MCP Setup for Claude](MCP_SETUP.md)
- [Workflow Examples](EXAMPLES.md)
- [Import & Modify Guide](IMPORT_AND_MODIFY.md)
- [Complete Command Reference](QUICK_REFERENCE.md)
