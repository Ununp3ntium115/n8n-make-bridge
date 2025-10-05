# Custom API Integration Guide

This guide shows you how to integrate custom APIs like Hostinger, Vultr, Linode, and other hosting/infrastructure services.

---

## 🚀 Supported Hosting & Infrastructure APIs

- **Hostinger VPS** - Manage virtual machines
- **DigitalOcean** - Manage droplets and infrastructure
- **Linode** - Cloud hosting and servers
- **Vultr** - Cloud compute instances
- **Cloudflare** - CDN, DNS, and security
- **AWS EC2** - Amazon cloud compute

---

## 📋 Quick Start with Hostinger

### 1. Get Your Hostinger API Token

1. Log in to [Hostinger](https://www.hostinger.com)
2. Navigate to **VPS → API**
3. Create a new API token
4. Copy the token (example: `tW9OHdqiPzuqWYkrGHNB3SJHIF7qL3zFop4wtTNMace58d4a`)

### 2. Add to Your Configuration

Edit `.env` file:

```bash
HOSTINGER_API_TOKEN=tW9OHdqiPzuqWYkrGHNB3SJHIF7qL3zFop4wtTNMace58d4a
```

### 3. Use in Workflows

#### Example 1: List All Virtual Machines

```bash
./cli.sh
```

```
💬 > generate "list all Hostinger virtual machines" --platform n8n --create
```

This creates an n8n workflow with an HTTP Request node:

```json
{
  "method": "GET",
  "url": "https://developers.hostinger.com/api/vps/v1/virtual-machines",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "httpHeaderAuth": {
    "name": "Authorization",
    "value": "Bearer {{$env.HOSTINGER_API_TOKEN}}"
  }
}
```

#### Example 2: Start a Virtual Machine

```
💬 > generate "start Hostinger VM with ID vm-12345" --platform n8n --create
```

Creates workflow with POST request:
- **URL**: `https://developers.hostinger.com/api/vps/v1/virtual-machines/vm-12345/start`
- **Method**: POST
- **Headers**: `Authorization: Bearer <token>`

#### Example 3: Monitor VMs and Send Slack Alerts

```
💬 > generate "check Hostinger VMs every hour and alert on Slack if any are down" --platform n8n --create
```

Creates workflow with:
1. **Schedule Trigger** (every hour)
2. **HTTP Request** to list VMs
3. **Filter** to find stopped VMs
4. **Slack** notification

---

## 🔧 Using Custom API Client in Code

### TypeScript/JavaScript

```typescript
import { HostingerClient } from './clients/customApiClient';

// Initialize client
const hostinger = new HostingerClient(process.env.HOSTINGER_API_TOKEN!);

// List all VMs
const vms = await hostinger.listVirtualMachines();
console.log(vms);

// Start a specific VM
await hostinger.startVirtualMachine('vm-12345');

// Stop a VM
await hostinger.stopVirtualMachine('vm-12345');

// Reboot a VM
await hostinger.rebootVirtualMachine('vm-12345');
```

### Generic Custom API Client

```typescript
import { CustomApiClient } from './clients/customApiClient';

// Create client for any API
const client = new CustomApiClient(
  'https://api.example.com/v1',  // Base URL
  'your-api-token',               // API Token
  'bearer'                        // Auth type: 'bearer', 'api-key', or 'custom'
);

// Make requests
const data = await client.get('/endpoint');
const result = await client.post('/create', { name: 'test' });
```

---

## 📝 Creating n8n HTTP Request Nodes

### Manual Node Configuration

When creating workflows, HTTP Request nodes are configured with:

```json
{
  "name": "Hostinger VPS API",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "GET",
    "url": "https://developers.hostinger.com/api/vps/v1/virtual-machines",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "httpHeaderAuth": {
      "name": "Authorization",
      "value": "=Bearer {{$env.HOSTINGER_API_TOKEN}}"
    },
    "options": {
      "response": {
        "response": {
          "responseFormat": "json"
        }
      }
    }
  }
}
```

---

## 🌐 Available API Endpoints

### Hostinger VPS API

**Base URL**: `https://developers.hostinger.com/api/vps/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/virtual-machines` | GET | List all VMs |
| `/virtual-machines/{id}` | GET | Get specific VM |
| `/virtual-machines/{id}/start` | POST | Start VM |
| `/virtual-machines/{id}/stop` | POST | Stop VM |
| `/virtual-machines/{id}/reboot` | POST | Reboot VM |

**Authentication**: `Authorization: Bearer <token>`

### DigitalOcean API

**Base URL**: `https://api.digitalocean.com/v2`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/droplets` | GET | List droplets |
| `/droplets` | POST | Create droplet |
| `/droplets/{id}` | DELETE | Delete droplet |
| `/droplets/{id}/actions` | POST | Perform action |

### Linode API

**Base URL**: `https://api.linode.com/v4`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/linode/instances` | GET | List instances |
| `/linode/instances` | POST | Create instance |
| `/linode/instances/{id}/boot` | POST | Boot instance |

### Vultr API

**Base URL**: `https://api.vultr.com/v2`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/instances` | GET | List instances |
| `/instances` | POST | Create instance |
| `/instances/{id}` | DELETE | Delete instance |

---

## 💡 Example Workflows

### 1. Automated VPS Deployment

**Description**: Create new Hostinger VPS when webhook triggered

```bash
generate "when webhook received, create new Hostinger VPS with specs from payload" --platform n8n --create
```

**Nodes**:
1. Webhook Trigger
2. HTTP Request (POST to create VM)
3. Slack notification with VM details

### 2. Infrastructure Monitoring

**Description**: Check all VMs every 5 minutes

```bash
generate "every 5 minutes check Hostinger VMs and alert Slack if CPU > 90%" --platform n8n --create
```

**Nodes**:
1. Schedule Trigger (5 min)
2. HTTP Request (list VMs)
3. Filter (CPU > 90%)
4. Slack alert

### 3. Cost Optimization

**Description**: Stop unused VMs to save money

```bash
generate "daily at 6PM stop all Hostinger VMs tagged as dev" --platform n8n --create
```

---

## 🔐 Security Best Practices

1. **Never hardcode API tokens** - Always use environment variables
2. **Use .env file** - Store tokens in `.env` (already in .gitignore)
3. **Rotate tokens regularly** - Generate new tokens every 90 days
4. **Limit permissions** - Create API tokens with minimum required permissions
5. **Monitor usage** - Check API logs for unusual activity

---

## 🆘 Troubleshooting

### "401 Unauthorized"

**Problem**: API token is invalid or expired

**Solution**:
```bash
# Verify token in .env
cat .env | grep HOSTINGER

# Test token manually
curl -X GET "https://developers.hostinger.com/api/vps/v1/virtual-machines" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### "403 Forbidden"

**Problem**: Token doesn't have required permissions

**Solution**: Regenerate token with correct permissions in Hostinger dashboard

### "Rate Limit Exceeded"

**Problem**: Too many API requests

**Solution**: Add delays between requests or implement exponential backoff

---

## 📚 Additional Resources

- [Hostinger API Documentation](https://developers.hostinger.com/)
- [DigitalOcean API Docs](https://docs.digitalocean.com/reference/api/)
- [Linode API Docs](https://www.linode.com/docs/api/)
- [Vultr API Docs](https://www.vultr.com/api/)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

## 🎯 Next Steps

1. Add your API token to `.env`
2. Test with a simple workflow
3. Build automation for your infrastructure
4. Set up monitoring and alerts

**Ready to automate?**

```bash
./cli.sh
💬 > generate "your Hostinger automation idea" --platform n8n --create
```
