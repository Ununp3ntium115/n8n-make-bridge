# Make.com Complete API Reference

Full implementation of all Make.com API endpoints from https://developers.make.com/api-documentation/api-reference

---

## 📑 Table of Contents

- [Scenarios](#scenarios)
- [Data Stores](#data-stores)
- [Data Structures](#data-structures)
- [Functions](#functions)
- [Keys](#keys-credentials)
- [Devices](#devices)
- [Scenario Logs](#scenario-logs-executions)
- [Teams](#teams)
- [Team Members](#team-members)
- [Organizations](#organizations)
- [Users](#users)
- [Connections](#connections)
- [Webhooks](#webhooks-hooks)
- [Apps & Modules](#apps--modules)
- [Templates](#templates)
- [Variables](#variables)

---

## Scenarios

### List Scenarios
```typescript
await client.getScenarios(teamId?, organizationId?);
```

**API:** `GET /scenarios?teamId={teamId}`

### Get Scenario
```typescript
await client.getScenario(scenarioId);
```

**API:** `GET /scenarios/{scenarioId}`

### Get Scenario Blueprint
```typescript
await client.getScenarioBlueprint(scenarioId, blueprintId?, draft?);
```

**API:** `GET /scenarios/{scenarioId}/blueprint`

### Create Scenario
```typescript
await client.createScenario({
  name: 'My Workflow',
  teamId: '123',
  scheduling: { type: 'interval', interval: 15 }
});
```

**API:** `POST /scenarios`

### Update Scenario
```typescript
await client.updateScenario(scenarioId, { name: 'Updated Name' });
```

**API:** `PATCH /scenarios/{scenarioId}`

### Delete Scenario
```typescript
await client.deleteScenario(scenarioId);
```

**API:** `DELETE /scenarios/{scenarioId}`

### Start Scenario
```typescript
await client.startScenario(scenarioId);
```

**API:** `POST /scenarios/{scenarioId}/start`

### Stop Scenario
```typescript
await client.stopScenario(scenarioId);
```

**API:** `POST /scenarios/{scenarioId}/stop`

### Run Scenario
```typescript
await client.runScenario(scenarioId, data?);
```

**API:** `POST /scenarios/{scenarioId}/run`

### Get Blueprint Versions
```typescript
await client.getBlueprintVersions(scenarioId);
```

**API:** `GET /scenarios/{scenarioId}/blueprints`

---

## Data Stores

### List Data Stores
```typescript
await client.getDataStores(teamId, {
  sortDir: 'asc',
  sortBy: 'name',
  limit: 100,
  offset: 0
});
```

**API:** `GET /data-stores?teamId={teamId}&pg[sortDir]=asc`

### Create Data Store
```typescript
await client.createDataStore({
  name: 'Customers',
  teamId: '123',
  datastructureId: 178,
  maxSizeMB: 1
});
```

**API:** `POST /data-stores`

### Get Data Store Records
```typescript
await client.getDataStoreRecords(dataStoreId, {
  limit: 100,
  offset: 0
});
```

**API:** `GET /data-stores/{dataStoreId}/data`

### Add Data Store Record
```typescript
await client.addDataStoreRecord(dataStoreId, {
  key: 'customer-001',
  value: { name: 'John', email: 'john@example.com' }
});
```

**API:** `POST /data-stores/{dataStoreId}/data`

---

## Data Structures

### List Data Structures
```typescript
await client.getDataStructures(teamId);
```

**API:** `GET /datastructures?teamId={teamId}`

### Get Data Structure
```typescript
await client.getDataStructure(dataStructureId);
```

**API:** `GET /datastructures/{dataStructureId}`

### Create Data Structure
```typescript
await client.createDataStructure({
  name: 'Customer Schema',
  teamId: '123',
  spec: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'age', type: 'number' }
  ]
});
```

**API:** `POST /datastructures`

### Update Data Structure
```typescript
await client.updateDataStructure(dataStructureId, { name: 'Updated Schema' });
```

**API:** `PATCH /datastructures/{dataStructureId}`

### Delete Data Structure
```typescript
await client.deleteDataStructure(dataStructureId);
```

**API:** `DELETE /datastructures/{dataStructureId}`

---

## Functions

### List Functions
```typescript
await client.getFunctions(teamId);
```

**API:** `GET /functions?teamId={teamId}`

### Get Function
```typescript
await client.getFunction(functionId);
```

**API:** `GET /functions/{functionId}`

### Create Function
```typescript
await client.createFunction({
  name: 'Calculate Tax',
  teamId: '123',
  code: 'return input.amount * 0.15;'
});
```

**API:** `POST /functions`

### Update Function
```typescript
await client.updateFunction(functionId, { code: 'return input.amount * 0.20;' });
```

**API:** `PATCH /functions/{functionId}`

### Delete Function
```typescript
await client.deleteFunction(functionId);
```

**API:** `DELETE /functions/{functionId}`

---

## Keys (Credentials)

### List Keys
```typescript
await client.getKeys(teamId);
```

**API:** `GET /keys?teamId={teamId}`

### Get Key
```typescript
await client.getKey(keyId);
```

**API:** `GET /keys/{keyId}`

### Create Key
```typescript
await client.createKey({
  name: 'API Key',
  teamId: '123',
  type: 'api',
  data: { apiKey: 'secret' }
});
```

**API:** `POST /keys`

### Update Key
```typescript
await client.updateKey(keyId, { name: 'Updated Key' });
```

**API:** `PATCH /keys/{keyId}`

### Delete Key
```typescript
await client.deleteKey(keyId);
```

**API:** `DELETE /keys/{keyId}`

---

## Devices

### List Devices
```typescript
await client.getDevices(teamId);
```

**API:** `GET /devices?teamId={teamId}`

### Get Device
```typescript
await client.getDevice(deviceId);
```

**API:** `GET /devices/{deviceId}`

### Delete Device
```typescript
await client.deleteDevice(deviceId);
```

**API:** `DELETE /devices/{deviceId}`

---

## Scenario Logs (Executions)

### Get Scenario Execution Logs
```typescript
await client.getScenarioLogs(scenarioId, {
  limit: 50,
  offset: 0,
  status: 'error'
});
```

**API:** `GET /scenarios/{scenarioId}/executions`

**Status Options:** `success`, `error`, `warning`

### Get Execution Details
```typescript
await client.getScenarioExecution(scenarioId, executionId);
```

**API:** `GET /scenarios/{scenarioId}/executions/{executionId}`

---

## Teams

### List Teams
```typescript
await client.getTeams(organizationId?);
```

**API:** `GET /teams?organizationId={organizationId}`

---

## Team Members

### List Team Members
```typescript
await client.getTeamMembers(teamId);
```

**API:** `GET /teams/{teamId}/users`

### Add Team Member
```typescript
await client.addTeamMember(teamId, {
  userId: 'user-123',
  role: 'admin'
});
```

**API:** `POST /teams/{teamId}/users`

**Roles:** `admin`, `member`, `viewer`

### Update Team Member
```typescript
await client.updateTeamMember(teamId, userId, 'admin');
```

**API:** `PATCH /teams/{teamId}/users/{userId}`

### Remove Team Member
```typescript
await client.removeTeamMember(teamId, userId);
```

**API:** `DELETE /teams/{teamId}/users/{userId}`

---

## Organizations

### List Organizations
```typescript
await client.getOrganizations();
```

**API:** `GET /organizations`

### Get Organization
```typescript
await client.getOrganization(organizationId);
```

**API:** `GET /organizations/{organizationId}`

**Response includes:** `apiLimit` (rate limit for organization)

### Update Organization
```typescript
await client.updateOrganization(organizationId, { name: 'New Name' });
```

**API:** `PATCH /organizations/{organizationId}`

### Get Organization Usage
```typescript
await client.getOrganizationUsage(organizationId);
```

**API:** `GET /organizations/{organizationId}/usage`

### Get Organization Members
```typescript
await client.getOrganizationMembers(organizationId);
```

**API:** `GET /organizations/{organizationId}/users`

---

## Users

### Get Current User
```typescript
await client.getMe();
```

**API:** `GET /users/me`

---

## Connections

### List Connections
```typescript
await client.getConnections(teamId?);
```

**API:** `GET /connections?teamId={teamId}`

### Get Connection
```typescript
await client.getConnection(connectionId);
```

**API:** `GET /connections/{connectionId}`

### Create Connection
```typescript
await client.createConnection({
  name: 'Gmail Account',
  teamId: '123',
  accountName: 'work@example.com',
  accountType: 'google',
  accountId: 'acc-123'
});
```

**API:** `POST /connections`

### Update Connection
```typescript
await client.updateConnection(connectionId, { name: 'Updated Name' });
```

**API:** `PATCH /connections/{connectionId}`

### Delete Connection
```typescript
await client.deleteConnection(connectionId);
```

**API:** `DELETE /connections/{connectionId}`

### Test Connection
```typescript
await client.testConnectionEndpoint(connectionId);
```

**API:** `POST /connections/{connectionId}/test`

---

## Webhooks (Hooks)

### List Webhooks
```typescript
await client.getWebhooks(teamId?);
```

**API:** `GET /hooks?teamId={teamId}`

### Get Webhook
```typescript
await client.getWebhook(hookId);
```

**API:** `GET /hooks/{hookId}`

### Create Webhook
```typescript
await client.createWebhook({
  name: 'My Webhook',
  teamId: '123',
  url: 'https://example.com/webhook'
});
```

**API:** `POST /hooks`

### Update Webhook
```typescript
await client.updateWebhook(hookId, { name: 'Updated Webhook' });
```

**API:** `PATCH /hooks/{hookId}`

### Delete Webhook
```typescript
await client.deleteWebhook(hookId);
```

**API:** `DELETE /hooks/{hookId}`

---

## Apps & Modules

### List Apps
```typescript
await client.getApps();
```

**API:** `GET /apps`

Returns all available Make.com apps (Gmail, Slack, etc.)

### Get App
```typescript
await client.getApp(appId);
```

**API:** `GET /apps/{appId}`

### List App Modules
```typescript
await client.getAppModules(appId);
```

**API:** `GET /apps/{appId}/modules`

Returns available modules/actions for an app

---

## Templates

### List Templates
```typescript
await client.getTemplates({
  category: 'productivity',
  search: 'gmail',
  limit: 20
});
```

**API:** `GET /templates?category={category}&search={search}`

### Get Template
```typescript
await client.getTemplate(templateId);
```

**API:** `GET /templates/{templateId}`

### Clone Template
```typescript
await client.cloneTemplate(templateId, teamId, 'My Custom Workflow');
```

**API:** `POST /templates/{templateId}/clone`

Creates a new scenario from template

---

## Variables

### List Variables
```typescript
await client.getVariables(teamId);
```

**API:** `GET /variables?teamId={teamId}`

### Create Variable
```typescript
await client.createVariable({
  name: 'API_URL',
  teamId: '123',
  value: 'https://api.example.com'
});
```

**API:** `POST /variables`

### Update Variable
```typescript
await client.updateVariable(variableId, 'https://api.newurl.com');
```

**API:** `PATCH /variables/{variableId}`

### Delete Variable
```typescript
await client.deleteVariable(variableId);
```

**API:** `DELETE /variables/{variableId}`

---

## 🔧 Utility Methods

### Test Connection
```typescript
const isConnected = await client.testConnection();
```

Tests if API token is valid

### Get Rate Limit Status
```typescript
const { remaining, resetAt } = client.getRateLimitStatus();
console.log(`${remaining} requests remaining until ${resetAt}`);
```

Tracks rate limit from response headers

---

## 📊 Complete Example

```typescript
import { MakeClient } from './clients/makeClient';

// Initialize
const client = new MakeClient(
  process.env.MAKE_API_TOKEN!,
  process.env.MAKE_REGION || 'eu1'
);

// Test connection
if (!await client.testConnection()) {
  console.error('Failed to connect to Make.com API');
  process.exit(1);
}

// Get user info
const user = await client.getMe();
console.log(`Logged in as: ${user.name}`);

// List teams
const teams = await client.getTeams();
const teamId = teams[0].id;

// List scenarios
const scenarios = await client.getScenarios(teamId);
console.log(`Found ${scenarios.length} scenarios`);

// Get data stores with pagination
const stores = await client.getDataStores(teamId, {
  sortDir: 'asc',
  limit: 50
});

// Create new data store
const newStore = await client.createDataStore({
  name: 'Customers',
  teamId,
  maxSizeMB: 1
});

// Add record
await client.addDataStoreRecord(newStore.dataStore.id, {
  key: 'cust-001',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// List templates
const templates = await client.getTemplates({
  search: 'gmail',
  limit: 10
});

// Clone template
const scenario = await client.cloneTemplate(
  templates[0].id,
  teamId,
  'Email Automation'
);

// Start the scenario
await client.startScenario(scenario.scenario.id);

// Get execution logs
const logs = await client.getScenarioLogs(scenario.scenario.id, {
  limit: 10,
  status: 'error'
});

// Check rate limit
const { remaining } = client.getRateLimitStatus();
console.log(`API calls remaining: ${remaining}`);
```

---

## 🚀 All Endpoints Implemented

✅ **Scenarios** (9 endpoints)
✅ **Data Stores** (4 endpoints)
✅ **Data Structures** (5 endpoints)
✅ **Functions** (5 endpoints)
✅ **Keys** (5 endpoints)
✅ **Devices** (3 endpoints)
✅ **Scenario Logs** (2 endpoints)
✅ **Teams** (1 endpoint + 4 member endpoints)
✅ **Organizations** (5 endpoints)
✅ **Users** (1 endpoint)
✅ **Connections** (6 endpoints)
✅ **Webhooks** (5 endpoints)
✅ **Apps** (3 endpoints)
✅ **Templates** (3 endpoints)
✅ **Variables** (4 endpoints)

**Total: 65+ API endpoints fully implemented!**

---

## 📚 Resources

- [Make.com API Docs](https://developers.make.com/)
- [API Reference](https://developers.make.com/api-documentation/api-reference)
- [Make.com Community](https://community.make.com/)

---

**Ready to use the complete Make.com API!** 🎉
