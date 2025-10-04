# Complete Setup Guide - Copy & Paste Ready

This guide includes EVERYTHING you need to set up the n8n-Make Bridge, including where to get all API keys.

---

## 📋 Prerequisites Checklist

Before you start, you need:

- [ ] Node.js 18+ installed
- [ ] An n8n instance (local or cloud)
- [ ] A Make.com account (free tier works!)
- [ ] (Optional) Claude Desktop for MCP
- [ ] (Optional) OpenAI/Anthropic API keys for AI features

---

## 🚀 Step 1: Install the Bridge (30 seconds)

```bash
# Clone or download the project
cd n8n.make.io

# Run the installer
./install.sh
```

This installs everything and creates your `.env` file.

---

## 🔑 Step 2: Get Your API Keys

### **A. n8n API Key** (Required)

#### If using n8n locally:

1. **Start n8n:**
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   # OR
   npx n8n
   ```

2. **Open n8n:** http://localhost:5678

3. **Create API Key:**
   - Click your profile (bottom left)
   - Go to **Settings**
   - Click **API** in the sidebar
   - Click **Create API Key**
   - Give it a name: `n8n-make-bridge`
   - **Copy the key** (it looks like: `n8n_api_1234567890abcdef...`)

4. **Save it:**
   ```bash
   N8N_BASE_URL=http://localhost:5678
   N8N_API_KEY=n8n_api_1234567890abcdef1234567890abcdef
   ```

#### If using n8n Cloud:

1. **Go to:** https://app.n8n.cloud

2. **Get your instance URL:**
   - Look at your browser URL
   - Example: `https://mycompany.app.n8n.cloud`

3. **Create API Key:**
   - Settings → API → Create API Key
   - Copy the key

4. **Save it:**
   ```bash
   N8N_BASE_URL=https://mycompany.app.n8n.cloud
   N8N_API_KEY=n8n_api_your_actual_key_here
   ```

---

### **B. Make.com API Token** (Required)

1. **Sign up for Make.com:** https://www.make.com/en/register
   - Free tier is fine!
   - Remember your region (EU or US)

2. **Get your API Token:**
   - Log in to Make.com
   - Click your **profile picture** (top right)
   - Click **API**
   - Click **Add Token**
   - Give it a name: `n8n-bridge`
   - **Copy the token** (64 characters, all lowercase letters and numbers)

3. **Find your region:**
   - Look at your Make.com URL
   - Examples:
     - `https://eu1.make.com` → Region is `eu1`
     - `https://us1.make.com` → Region is `us1`
     - `https://eu2.make.com` → Region is `eu2`

4. **Save it:**
   ```bash
   MAKE_API_TOKEN=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd
   MAKE_REGION=eu1
   ```

---

### **C. Optional: Team/Organization IDs** (For Business Users)

#### Get Team ID:
1. In Make.com, go to your Team
2. Click **Team Settings**
3. Copy the **Team ID**

```bash
MAKE_TEAM_ID=12345
```

#### Get Organization ID:
1. In Make.com, go to Organization Settings
2. Copy the **Organization ID**

```bash
MAKE_ORG_ID=67890
```

---

### **D. Optional: AI API Keys** (For Advanced AI Features)

#### OpenAI API Key:
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click **Create new secret key**
4. Name it: `n8n-make-bridge`
5. **Copy the key** (starts with `sk-`)

```bash
OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef
```

#### Anthropic Claude API Key:
1. Go to: https://console.anthropic.com/settings/keys
2. Sign in or create account
3. Click **Create Key**
4. Name it: `n8n-make-bridge`
5. **Copy the key** (starts with `sk-ant-`)

```bash
ANTHROPIC_API_KEY=sk-ant-1234567890abcdef1234567890abcdef
```

---

## ⚙️ Step 3: Configure Your .env File

### **Option A: Copy & Paste Template (Easiest)**

Copy this entire block, replace the values, and paste into `.env`:

```bash
# ============================================
#  n8n Configuration
# ============================================

# Replace with your n8n URL
N8N_BASE_URL=http://localhost:5678

# Replace with your n8n API key
N8N_API_KEY=n8n_api_paste_your_key_here

# ============================================
#  Make.com Configuration
# ============================================

# Replace with your Make.com API token
MAKE_API_TOKEN=paste_your_64_character_token_here

# Replace with your region (eu1, eu2, us1, or us2)
MAKE_REGION=eu1

# Optional: Team/Organization IDs
MAKE_TEAM_ID=
MAKE_ORG_ID=

# ============================================
#  Server Configuration
# ============================================

PORT=3000
NODE_ENV=development

# ============================================
#  Optional: AI Services
# ============================================

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# ============================================
#  Optional: Debug
# ============================================

DEBUG=false
LOG_LEVEL=info
```

### **Option B: Edit the Existing File**

```bash
# Open the .env file
nano .env
# OR
vim .env
# OR use any text editor
```

Replace these values:
1. `N8N_BASE_URL` → Your n8n URL
2. `N8N_API_KEY` → Your n8n API key
3. `MAKE_API_TOKEN` → Your Make.com token
4. `MAKE_REGION` → Your Make.com region

---

## ✅ Step 4: Verify Your Setup

### **Test n8n Connection:**

```bash
curl -H "X-N8N-API-KEY: your_n8n_api_key" \
     http://localhost:5678/api/v1/workflows
```

**Expected:** List of workflows (or empty array `[]`)

**Error?** Check:
- Is n8n running?
- Is the URL correct?
- Is the API key correct?

---

### **Test Make.com Connection:**

```bash
curl -H "Authorization: Token your_make_token" \
     https://eu1.make.com/api/v2/scenarios
```

**Expected:** List of scenarios (or `{"scenarios": []}`)

**Error?** Check:
- Is the token correct?
- Is the region correct? (eu1, us1, etc.)

---

## 🎉 Step 5: Start Using It!

### **Interactive CLI (Recommended for First Use):**

```bash
./cli.sh
```

Try these commands:
```
💬 > templates
💬 > services microsoft
💬 > list --platform n8n
💬 > help
```

### **Generate Your First Workflow:**

```
💬 > generate "read gmail and post summaries to slack" --platform n8n
```

### **Create It:**

```
💬 > generate "read gmail and post summaries to slack" --platform n8n --create
```

---

## 🔧 Alternative: Run as REST API

```bash
./start.sh api
```

Then use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Send daily email summaries to Slack",
    "platform": "n8n",
    "createWorkflow": true
  }'
```

---

## 🤖 Alternative: Run as MCP Server (Claude Desktop)

1. **Configure Claude Desktop:**

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
        "N8N_API_KEY": "n8n_api_your_actual_key",
        "MAKE_API_TOKEN": "your_make_token_here",
        "MAKE_REGION": "eu1"
      }
    }
  }
}
```

**Important:** Use the **absolute path** to the server.js file!

2. **Start the MCP server:**

```bash
./start.sh mcp
```

3. **Restart Claude Desktop**

4. **Talk to Claude:**

```
You: "Create a workflow that reads my Gmail and summarizes
emails with AI, then posts to Slack #work-digest"

Claude: [Uses MCP tools to generate and create the workflow]
```

---

## 📝 Complete Configuration Reference

### **Minimal Required Configuration:**

```bash
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_key
MAKE_API_TOKEN=your_token
MAKE_REGION=eu1
```

### **Full Configuration with All Options:**

```bash
# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=n8n_api_1234567890abcdef

# Make.com
MAKE_API_TOKEN=1234567890abcdef1234567890abcdef
MAKE_REGION=eu1
MAKE_TEAM_ID=12345
MAKE_ORG_ID=67890

# Server
PORT=3000
NODE_ENV=production

# AI (optional)
OPENAI_API_KEY=sk-1234567890abcdef
ANTHROPIC_API_KEY=sk-ant-1234567890abcdef

# Debug
DEBUG=false
LOG_LEVEL=info
```

---

## 🆘 Troubleshooting

### **"n8n client not configured"**

**Problem:** Missing or incorrect n8n credentials

**Solution:**
1. Check `.env` has `N8N_BASE_URL` and `N8N_API_KEY`
2. Verify n8n is running: `curl http://localhost:5678`
3. Test API key:
   ```bash
   curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows
   ```

---

### **"Make.com client not configured"**

**Problem:** Missing or incorrect Make.com credentials

**Solution:**
1. Check `.env` has `MAKE_API_TOKEN` and `MAKE_REGION`
2. Verify region is correct (check your Make.com URL)
3. Test token:
   ```bash
   curl -H "Authorization: Token your_token" https://eu1.make.com/api/v2/scenarios
   ```

---

### **"Command not found: ./install.sh"**

**Problem:** Scripts not executable

**Solution:**
```bash
chmod +x install.sh setup.sh start.sh cli.sh
./install.sh
```

---

### **"EPERM: operation not permitted" (Windows/WSL)**

**Problem:** Symlink issues on Windows

**Solution:**
```bash
npm install --no-bin-links
npm run build
```

---

### **"Cannot connect to n8n"**

**Solutions:**

1. **n8n not running:**
   ```bash
   # Start n8n
   docker run -it --rm -p 5678:5678 n8nio/n8n
   # OR
   npx n8n
   ```

2. **Wrong URL:**
   - Local: `http://localhost:5678`
   - Cloud: `https://your-instance.app.n8n.cloud`

3. **Firewall blocking:**
   - Check if port 5678 is open
   - Try: `curl http://localhost:5678`

---

### **"Unauthorized" error from Make.com**

**Solutions:**

1. **Token expired:**
   - Create new token in Make.com
   - Update `.env`

2. **Wrong region:**
   - Check your Make.com URL
   - Update `MAKE_REGION` in `.env`

3. **Token typo:**
   - Re-copy the token (no spaces!)
   - Token is exactly 64 characters

---

## 🎓 Quick Start Commands

After setup, try these:

```bash
# 1. Start CLI
./cli.sh

# 2. List templates
💬 > templates

# 3. Generate workflow
💬 > generate "your workflow idea" --platform n8n --create

# 4. List workflows
💬 > list --platform n8n

# 5. Import and modify
💬 > import workflow_id --from n8n
💬 > modify workflow_id "add slack notification" --platform n8n --update
```

---

## 📚 What's Next?

1. ✅ [Try the Quick Start Guide](QUICK_START.md)
2. 📖 [Read the Examples](EXAMPLES.md)
3. 🤖 [Set up MCP for Claude](MCP_SETUP.md)
4. 🔧 [Learn about Import & Modify](IMPORT_AND_MODIFY.md)
5. 📋 [Check the Command Reference](QUICK_REFERENCE.md)

---

## 🔐 Security Notes

- **Never commit `.env` to git** (it's in `.gitignore`)
- **Keep API keys secret**
- **Use environment variables in production**
- **Regenerate keys if exposed**
- **Use separate keys for dev/prod**

---

## ✅ Setup Checklist

Complete this checklist:

- [ ] Node.js 18+ installed
- [ ] n8n instance running
- [ ] n8n API key obtained
- [ ] Make.com account created
- [ ] Make.com API token obtained
- [ ] Region identified (eu1, us1, etc.)
- [ ] Project cloned/downloaded
- [ ] Ran `./install.sh`
- [ ] Created/edited `.env` file
- [ ] Added all API keys to `.env`
- [ ] Tested n8n connection
- [ ] Tested Make.com connection
- [ ] Ran `./cli.sh` successfully
- [ ] Generated first workflow

**All done? You're ready to automate!** 🎉

---

## 💡 Pro Tips

1. **Use `--create` flag** to instantly create workflows:
   ```
   generate "..." --platform n8n --create
   ```

2. **Preview first** without `--create` to see what it generates

3. **Save favorite commands** in a script:
   ```bash
   #!/bin/bash
   ./cli.sh << EOF
   templates email
   generate "my common workflow" --platform n8n --create
   exit
   EOF
   ```

4. **Use team/org IDs** for business accounts to access shared workflows

5. **Keep `.env` backed up** securely (encrypted!)

---

**You're all set! Happy automating!** 🚀
