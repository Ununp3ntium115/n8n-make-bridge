# Make.com API Integration Guide

Complete guide for using the Make.com API with the n8n-Make Bridge.

---

## 📚 Make.com API Structure

### Base URL Format

```
{zone_url}/api/{version}/{endpoint}
```

**Example:**
```
https://eu1.make.com/api/v2/scenarios
```

### Components

1. **Zone URL** - Geographic region of your organization
2. **API Version** - Currently `v2`
3. **Endpoint** - Specific resource (scenarios, data-stores, teams, etc.)

---

## 🌍 Zone URLs

Find your zone URL in your Make.com dashboard address bar:

| Zone | URL | Region |
|------|-----|--------|
| EU1 | `https://eu1.make.com` | Europe (Primary) |
| EU2 | `https://eu2.make.com` | Europe (Secondary) |
| US1 | `https://us1.make.com` | United States (Primary) |
| US2 | `https://us2.make.com` | United States (Secondary) |
| Enterprise EU1 | `https://eu1.make.celonis.com` | Enterprise Europe |
| Enterprise US1 | `https://us1.make.celonis.com` | Enterprise US |

**⚠️ Important:** Always use the correct zone URL. Requests to wrong zones will fail.

---

## 🔐 Authentication

### Token-Based Authentication

Make.com uses **Token** authentication (NOT Bearer):

```bash
Authorization: Token {your-api-token}
```

**Example cURL:**
```bash
curl -X GET 'https://eu1.make.com/api/v2/scenarios?teamId=35' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Token 93dc8837-2911-4711-a766-59c1167a974d'
```

### Getting Your API Token

1. Log in to [Make.com](https://make.com)
2. Click your profile (top right)
3. Go to **API** section
4. Click **Add Token**
5. Give it a name and select scopes
6. Copy the generated token

**Token Format:** 64-character hexadecimal string
```
93dc8837-2911-4711-a766-59c1167a974d1234567890abcdef1234567890abcd
```

---

## ⚡ Rate Limits

API requests are limited based on your organization plan:

| Plan | Requests per Minute |
|------|---------------------|
| Core | 60 |
| Pro | 120 |
| Teams | 240 |
| Enterprise | 1,000 |

**Rate Limit Exceeded Error (429):**
```json
{
  "message": "Requests limit for organization exceeded, please try again later."
}
```

### Check Your Rate Limit

```bash
curl -X GET 'https://eu1.make.com/api/v2/organizations/{organizationId}' \
  -H 'Authorization: Token YOUR_TOKEN'
```

Response includes:
```json
{
  "license": {
    "apiLimit": 240
  }
}
```

---

## 📋 API Resources

### Scenarios

**List all scenarios:**
```bash
GET /scenarios?teamId={teamId}
```

**Get specific scenario:**
```bash
GET /scenarios/{scenarioId}
```

**Get scenario blueprint:**
```bash
GET /scenarios/{scenarioId}/blueprint
```

**Create scenario:**
```bash
POST /scenarios
Content-Type: application/json

{
  "name": "My Workflow",
  "teamId": "123",
  "scheduling": {
    "type": "interval",
    "interval": 15
  }
}
```

**Update scenario:**
```bash
PATCH /scenarios/{scenarioId}
```

**Start/Stop scenario:**
```bash
POST /scenarios/{scenarioId}/start
POST /scenarios/{scenarioId}/stop
```

**Run scenario manually:**
```bash
POST /scenarios/{scenarioId}/run
```

### Data Stores

**List data stores:**
```bash
GET /data-stores?teamId={teamId}&pg[sortDir]=asc
```

**Create data store:**
```bash
POST /data-stores

{
  "name": "Customers",
  "teamId": "123",
  "datastructureId": 178,
  "maxSizeMB": 1
}
```

**Get records:**
```bash
GET /data-stores/{dataStoreId}/data?pg[limit]=100&pg[offset]=0
```

**Add record:**
```bash
POST /data-stores/{dataStoreId}/data

{
  "key": "customer-001",
  "value": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Users & Organizations

**Get current user:**
```bash
GET /users/me
```

**Get organization:**
```bash
GET /organizations/{organizationId}
```

**List teams:**
```bash
GET /teams?organizationId={organizationId}
```

### Connections

**List connections:**
```bash
GET /connections?teamId={teamId}
```

### Webhooks

**List webhooks:**
```bash
GET /hooks?teamId={teamId}
```

---

## 🔍 Query Parameters

### Pagination Parameters

Use `pg[parameter]` format (URL encoded as `pg%5Bparameter%5D`):

| Parameter | Description | Example |
|-----------|-------------|---------|
| `pg[sortBy]` | Field to sort by | `name`, `createdAt` |
| `pg[sortDir]` | Sort direction | `asc`, `desc` |
| `pg[limit]` | Max results | `100` |
| `pg[offset]` | Skip results | `0`, `100` |

**Example:**
```bash
GET /data-stores?teamId=35&pg[sortDir]=asc&pg[limit]=50&pg[offset]=0
```

**URL Encoded:**
```bash
GET /data-stores?teamId=35&pg%5BsortDir%5D=asc&pg%5Blimit%5D=50&pg%5Boffset%5D=0
```

---

## 🛠️ Using Make API in Bridge

### Configuration

Add to `.env`:
```bash
MAKE_API_TOKEN=your_64_character_token_here
MAKE_REGION=eu1
MAKE_TEAM_ID=35
```

### TypeScript Client

```typescript
import { MakeClient } from './clients/makeClient';

const client = new MakeClient(
  process.env.MAKE_API_TOKEN!,
  process.env.MAKE_REGION || 'eu1'
);

// Test connection
const connected = await client.testConnection();

// Get current user
const user = await client.getMe();

// List scenarios
const scenarios = await client.getScenarios('35');

// Get data stores with pagination
const stores = await client.getDataStores('35', {
  sortDir: 'asc',
  limit: 50,
  offset: 0
});

// Check rate limit
const rateLimit = client.getRateLimitStatus();
console.log(`Remaining: ${rateLimit.remaining}`);
```

### CLI Usage

```bash
./cli.sh

💬 > list --platform make
💬 > import scenario-123 --from make
💬 > translate scenario-123 --from make --to n8n --create
```

---

## 📊 Response Examples

### Successful Response (200 OK)

```json
{
  "dataStores": [
    {
      "id": 15043,
      "name": "Old data store",
      "records": 10,
      "size": "620",
      "maxSize": "1048576",
      "teamId": 35
    }
  ],
  "pg": {
    "sortBy": "name",
    "limit": 10000,
    "sortDir": "asc",
    "offset": 0
  }
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Invalid authentication credentials"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**429 Rate Limit:**
```json
{
  "message": "Requests limit for organization exceeded, please try again later."
}
```

---

## 🔧 HTTP Methods

| Method | Purpose | Body Required |
|--------|---------|---------------|
| GET | Retrieve data | No |
| POST | Create resource | Yes |
| PUT | Replace resource | Yes |
| PATCH | Update resource | Yes |
| DELETE | Delete resource | No |

**Always include request body for POST, PUT, PATCH requests.**

---

## ✅ Best Practices

1. **Use Correct Zone URL** - Check your Make.com dashboard URL
2. **Handle Rate Limits** - Implement exponential backoff
3. **Use Pagination** - Don't fetch all data at once
4. **Secure Tokens** - Store in `.env`, never in code
5. **Error Handling** - Check for 4xx and 5xx responses
6. **Test Connections** - Use `testConnection()` method
7. **Monitor Usage** - Track `rateLimitRemaining`

---

## 🆘 Troubleshooting

### Wrong Zone URL

**Error:** Request fails with connection error

**Solution:**
```bash
# Check your Make.com URL in browser
# Update .env with correct region
MAKE_REGION=eu1  # or us1, eu2, us2
```

### Invalid Token

**Error:** 401 Unauthorized

**Solution:**
```bash
# Generate new token in Make.com → API
# Update .env
MAKE_API_TOKEN=new_token_here
```

### Rate Limit Exceeded

**Error:** 429 Too Many Requests

**Solution:**
```typescript
// Check rate limit before requests
const { remaining } = client.getRateLimitStatus();
if (remaining && remaining < 10) {
  console.warn('Approaching rate limit, slowing down...');
  await sleep(60000); // Wait 1 minute
}
```

---

## 📚 Additional Resources

- [Make.com API Documentation](https://developers.make.com/)
- [Make.com API Reference](https://www.make.com/en/api-documentation)
- [Make.com Community](https://community.make.com/)

---

## 🎯 Quick Reference

```bash
# Test API connection
curl -X GET 'https://eu1.make.com/api/v2/users/me' \
  -H 'Authorization: Token YOUR_TOKEN'

# List scenarios
curl -X GET 'https://eu1.make.com/api/v2/scenarios?teamId=35' \
  -H 'Authorization: Token YOUR_TOKEN'

# Create scenario
curl -X POST 'https://eu1.make.com/api/v2/scenarios' \
  -H 'Authorization: Token YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Workflow","teamId":"35"}'

# List data stores (sorted)
curl -X GET 'https://eu1.make.com/api/v2/data-stores?teamId=35&pg%5BsortDir%5D=asc' \
  -H 'Authorization: Token YOUR_TOKEN'
```

---

**Ready to integrate Make.com!** 🚀

Run `./configure.sh` to set up your API token.
