# API Keys Cheatsheet - Copy & Paste Ready 🔑

Everything you need to get your API keys in one place.

---

## 🚀 Quick Setup (3 Commands)

```bash
./install.sh          # Install everything
./configure.sh        # Interactive wizard (guides you through getting keys)
./cli.sh              # Start using it!
```

---

## 📋 What You Need

| Service | Required? | Where to Get | Example Format |
|---------|-----------|--------------|----------------|
| **n8n API Key** | ✅ Required | n8n → Settings → API | `n8n_api_abc123...` |
| **Make.com Token** | ✅ Required | Make.com → Profile → API | `abc123def456...` (64 chars) |
| **Make.com Region** | ✅ Required | Check your URL | `eu1`, `us1`, `eu2`, `us2` |
| OpenAI Key | Optional | platform.openai.com | `sk-abc123...` |
| Anthropic Key | Optional | console.anthropic.com | `sk-ant-abc123...` |

---

## 🔑 Getting Your API Keys

### **1. n8n API Key** (Required)

#### **Local n8n:**

```bash
# Start n8n
docker run -it --rm -p 5678:5678 n8nio/n8n
# OR
npx n8n
```

**Get API Key:**
1. Open: http://localhost:5678
2. Click profile (bottom left) → **Settings** → **API**
3. Click **Create API Key**
4. Name: `n8n-make-bridge`
5. **Copy the key**

**Your .env:**
```bash
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=n8n_api_abc123def456ghi789jkl012mno345pqr
```

#### **n8n Cloud:**

1. Go to: https://app.n8n.cloud
2. Your URL: `https://yourcompany.app.n8n.cloud`
3. Settings → API → Create API Key
4. Copy the key

**Your .env:**
```bash
N8N_BASE_URL=https://yourcompany.app.n8n.cloud
N8N_API_KEY=n8n_api_abc123def456ghi789jkl012mno345pqr
```

**Test it:**
```bash
curl -H "X-N8N-API-KEY: your_key" http://localhost:5678/api/v1/workflows
# Should return: [] or list of workflows
```

---

### **2. Make.com API Token** (Required)

**Get Token:**
1. Sign up: https://www.make.com/en/register (free tier OK!)
2. Log in: https://www.make.com
3. Click **profile picture** (top right)
4. Click **API**
5. Click **Add Token**
6. Name: `n8n-bridge`
7. **Copy the 64-character token**

**Find Your Region:**
- Look at your browser URL:
  - `https://eu1.make.com` → Region: `eu1`
  - `https://us1.make.com` → Region: `us1`
  - `https://eu2.make.com` → Region: `eu2`

**Your .env:**
```bash
MAKE_API_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234yzabcdefgh1234
MAKE_REGION=eu1
```

**Test it:**
```bash
curl -H "Authorization: Token your_token" https://eu1.make.com/api/v2/scenarios
# Should return: {"scenarios": []} or list of scenarios
```

---

### **3. OpenAI API Key** (Optional - for AI features)

**Get Key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign in / Create account
3. Click **Create new secret key**
4. Name: `n8n-make-bridge`
5. **Copy the key** (starts with `sk-`)
6. **Save it now!** (You can't see it again)

**Your .env:**
```bash
OPENAI_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### **4. Anthropic Claude API Key** (Optional - for Claude AI)

**Get Key:**
1. Go to: https://console.anthropic.com/settings/keys
2. Sign in / Create account
3. Click **Create Key**
4. Name: `n8n-make-bridge`
5. **Copy the key** (starts with `sk-ant-`)

**Your .env:**
```bash
ANTHROPIC_API_KEY=sk-ant-abc123def456ghi789jkl012mno345pqr678stu901vwx
```

---

## 📝 Complete .env Template

### **Copy this entire block, fill in your keys, save as `.env`:**

```bash
# ============================================
#  n8n Configuration
# ============================================

# Your n8n instance URL (local or cloud)
N8N_BASE_URL=http://localhost:5678

# Your n8n API key (from Settings → API)
N8N_API_KEY=n8n_api_PASTE_YOUR_KEY_HERE

# ============================================
#  Make.com Configuration
# ============================================

# Your Make.com API token (64 characters)
MAKE_API_TOKEN=PASTE_YOUR_64_CHARACTER_TOKEN_HERE

# Your region (check your Make.com URL)
# Options: eu1, eu2, us1, us2
MAKE_REGION=eu1

# Optional: Team/Organization IDs (for business accounts)
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

# OpenAI (optional - for AI workflow features)
OPENAI_API_KEY=

# Anthropic Claude (optional - for Claude AI features)
ANTHROPIC_API_KEY=

# ============================================
#  Optional: Debug
# ============================================

DEBUG=false
LOG_LEVEL=info
```

---

## ✅ Quick Verification

### **Test n8n:**
```bash
curl -H "X-N8N-API-KEY: your_actual_key" \
     http://localhost:5678/api/v1/workflows
```
✅ Success: `[]` or list of workflows
❌ Error: Check URL and key

### **Test Make.com:**
```bash
curl -H "Authorization: Token your_actual_token" \
     https://eu1.make.com/api/v2/scenarios
```
✅ Success: `{"scenarios": []}` or list
❌ Error: Check token and region

---

## 🎯 Real Examples (Copy & Paste)

### **Example 1: Local n8n + EU Make.com**

```bash
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=n8n_api_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
MAKE_API_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
MAKE_REGION=eu1
PORT=3000
```

### **Example 2: n8n Cloud + US Make.com**

```bash
N8N_BASE_URL=https://mycompany.app.n8n.cloud
N8N_API_KEY=n8n_api_9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k
MAKE_API_TOKEN=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8
MAKE_REGION=us1
PORT=3000
```

### **Example 3: Full Setup with AI**

```bash
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=n8n_api_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
MAKE_API_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
MAKE_REGION=eu1
OPENAI_API_KEY=sk-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
ANTHROPIC_API_KEY=sk-ant-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
PORT=3000
```

---

## 🔧 Setup Methods

### **Method 1: Interactive Wizard (Easiest)**
```bash
./configure.sh
# Follow the prompts, wizard helps you get each key
```

### **Method 2: Manual Edit**
```bash
cp .env.example .env
nano .env
# Paste your keys
```

### **Method 3: Command Line**
```bash
cat > .env << 'EOF'
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_actual_key
MAKE_API_TOKEN=your_actual_token
MAKE_REGION=eu1
PORT=3000
EOF
```

---

## 🆘 Common Issues

### **"Command not found: curl"**
```bash
# Install curl
sudo apt install curl       # Ubuntu/Debian
brew install curl           # macOS
```

### **"Unauthorized" from n8n**
- Wrong API key
- n8n not running
- Wrong URL

**Fix:**
```bash
# Start n8n
docker run -it --rm -p 5678:5678 n8nio/n8n

# Regenerate API key in n8n Settings → API
```

### **"Unauthorized" from Make.com**
- Wrong token
- Token expired
- Wrong region

**Fix:**
```bash
# Regenerate token in Make.com Profile → API
# Check region in your browser URL
```

### **Region Mismatch**
If you see connection errors:
1. Check your Make.com URL
2. Update `MAKE_REGION` to match (eu1, us1, etc.)

---

## 📚 After Configuration

### **Start Using It:**

```bash
# Interactive CLI
./cli.sh

# REST API
./start.sh api

# MCP for Claude Desktop
./start.sh mcp
```

### **First Commands:**

```bash
# In CLI
💬 > templates
💬 > generate "your workflow idea" --platform n8n --create
💬 > list --platform n8n
```

---

## 💡 Pro Tips

1. **Keep .env secret** - Never commit to git
2. **Use separate keys** - Dev vs Production
3. **Rotate keys regularly** - Regenerate every 90 days
4. **Backup .env** - Store encrypted backup
5. **Document your keys** - Know which key is which

---

## 🔐 Security Checklist

- [ ] .env is in .gitignore ✅ (already done)
- [ ] API keys not in code ✅
- [ ] Keys stored securely
- [ ] Different keys for dev/prod
- [ ] Keys rotated regularly
- [ ] Access logs monitored

---

## 📖 More Help

- [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md) - Detailed instructions
- [Quick Start](QUICK_START.md) - Fast setup
- [Troubleshooting](COMPLETE_SETUP_GUIDE.md#troubleshooting) - Fix issues

---

**Got your keys? Let's go!** 🚀

```bash
./cli.sh
```
