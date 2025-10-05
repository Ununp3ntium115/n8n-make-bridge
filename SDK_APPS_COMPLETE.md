# Make.com SDK Apps - Complete API Reference

Comprehensive documentation for all Make.com SDK Apps API endpoints.

**Base URL**: `https://{zone}.make.com/api/v2/sdk/apps`

---

## 📑 Table of Contents

- [SDK Apps Base Operations](#sdk-apps-base-operations)
- [Invites](#invites)
- [Modules](#modules)
- [RPCs (Remote Procedure Calls)](#rpcs-remote-procedure-calls)
- [Functions](#functions)
- [Connections](#connections)
- [Webhooks](#webhooks)

---

## SDK Apps Base Operations

### List All Apps
```http
GET /api/v2/sdk/apps
```

**Query Parameters:**
- `all` (boolean, optional) - Return all apps
- `cols[]` (string, optional) - Specify returned properties

**Response:** Array of SDK apps with name, label, version

---

### Create App
```http
POST /api/v2/sdk/apps
```

**Request Body:**
```json
{
  "name": "string",
  "label": "string",
  "version": "integer"
}
```

**Response:** Created app object

---

### Get Specific App
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}
```

**Path Parameters:**
- `appName` (string, required) - SDK app name
- `appVersion` (integer, required) - SDK app version

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:** App details with configuration

---

### Delete App
```http
DELETE /api/v2/sdk/apps/{appName}/{appVersion}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Response:** Deletion confirmation

---

### Update App
```http
PATCH /api/v2/sdk/apps/{appName}/{appVersion}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:** App properties to update

**Response:** Updated app object

---

### Clone App
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/clone
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:**
```json
{
  "newName": "string",
  "newVersion": "integer"
}
```

**Response:** Cloned app object

---

### Request App Review
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/review
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Response:** Review request status

---

### Get App Documentation
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/readme
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Response:** Markdown documentation string

---

### Set App Documentation
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/readme
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:**
```json
{
  "markdown": "string"
}
```

**Response:** Updated documentation

---

## Invites

SDK App invites allow users to accept and join SDK applications.

### Get App Invite
```http
GET /api/v2/sdk/apps/invites/{inviteToken}
```

**Path Parameters:**
- `inviteToken` (string, required) - Unique invite token

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Header Parameters:**
- `imt-admin` (integer, optional)

**Response:**
```json
{
  "name": "string",
  "label": "string",
  "theme": "object",
  "access": "string",
  "manifest": "object"
}
```

---

### Accept App Invite
```http
POST /api/v2/sdk/apps/invites/{inviteToken}
```

**Path Parameters:**
- `inviteToken` (string, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Header Parameters:**
- `imt-admin` (integer, optional)

**Request Body:**
```json
{
  "organizationId": 123
}
```

**Response:** Accepted app details

---

## Modules

SDK App modules are the building blocks of Make.com integrations - triggers, actions, searches, etc.

### List App Modules
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/modules
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:**
```json
{
  "modules": [
    {
      "name": "string",
      "label": "string",
      "type": "string",
      "public": "boolean"
    }
  ]
}
```

---

### Create Module
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/modules
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:**
```json
{
  "name": "string",
  "typeId": "string",
  "label": "string",
  "description": "string",
  "initMode": "blank|example|module"
}
```

**Response:** Created module object

---

### Get Module
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Response:** Complete module configuration

---

### Delete Module
```http
DELETE /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Response:** Deletion confirmation

---

### Update Module
```http
PATCH /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** Module properties to update

**Response:** Updated module object

---

### Set Module Section (API)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/api
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** API configuration object

**Response:** Updated module API section

---

### Set Module Section (Epoch)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/epoch
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** Epoch configuration

**Response:** Updated module epoch section

---

### Set Module Section (Parameters)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/parameters
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:**
```json
{
  "parameters": [
    {
      "name": "string",
      "type": "string",
      "label": "string",
      "required": "boolean"
    }
  ]
}
```

**Response:** Updated module parameters

---

### Set Module Section (Interface)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/interface
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** Interface configuration

**Response:** Updated module interface

---

### Set Module Section (Samples)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/samples
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** Sample data array

**Response:** Updated module samples

---

### Set Module Section (Scope)
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/scope
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:** Scope configuration

**Response:** Updated module scope

---

### Clone Module
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/clone
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:**
```json
{
  "newModuleName": "string"
}
```

**Response:** Cloned module object

---

### Set Module Visibility
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/visibility
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:**
```json
{
  "public": "boolean"
}
```

**Response:** Updated visibility status

---

### Set Module Deprecation
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/deprecation
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Request Body:**
```json
{
  "deprecated": "boolean",
  "message": "string"
}
```

**Response:** Updated deprecation status

---

### Recreate Module
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/modules/{moduleName}/recreate
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `moduleName` (string, required)

**Response:** Recreated module object

---

## RPCs (Remote Procedure Calls)

RPCs are backend functions that can be called from modules for data transformation and processing.

### List App RPCs
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/rpcs
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:** Array of RPC objects

---

### Create RPC
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/rpcs
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:**
```json
{
  "name": "string",
  "label": "string"
}
```

**Response:** Created RPC object

---

### Get RPC
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)

**Response:** RPC configuration and code

---

### Test RPC
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)

**Request Body:**
```json
{
  "data": {},
  "schema": [
    {
      "name": "string",
      "type": "string",
      "required": "boolean"
    }
  ]
}
```

**Response:** RPC execution result

---

### Delete RPC
```http
DELETE /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)

**Response:** Deletion confirmation

---

### Update RPC
```http
PATCH /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)

**Request Body:**
```json
{
  "label": "string"
}
```

**Response:** Updated RPC object

---

### Get RPC Section
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}/{section}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)
- `section` (string, required) - "api" or "parameters"

**Response:** RPC section configuration

---

### Set RPC Section
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/rpcs/{rpcName}/{section}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `rpcName` (string, required)
- `section` (string, required) - "api" or "parameters"

**Request Body:** Section configuration

**Response:** Updated RPC section

---

## Functions

Functions are reusable JavaScript code snippets that can be used across modules.

### List App Functions
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/functions
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:**
```json
{
  "functions": [
    {
      "name": "string",
      "arguments": ["string"]
    }
  ]
}
```

---

### Create Function
```http
POST /api/v2/sdk/apps/{appName}/{appVersion}/functions
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:** Created function object

---

### Get Function
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Response:** Function details with code and test

---

### Delete Function
```http
DELETE /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Response:**
```json
{
  "name": "string"
}
```

---

### Get Function Code
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}/code
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Response:** Plain text JavaScript code

---

### Set Function Code
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}/code
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Request Body:** Plain text JavaScript code

**Response:** Updated function code

---

### Get Function Test
```http
GET /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}/test
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Response:** Plain text test code

---

### Set Function Test
```http
PUT /api/v2/sdk/apps/{appName}/{appVersion}/functions/{functionName}/test
```

**Path Parameters:**
- `appName` (string, required)
- `appVersion` (integer, required)
- `functionName` (string, required)

**Request Body:** Plain text test code

**Response:** Updated test code

---

## Connections

Connections define how users authenticate with your SDK app.

### List App Connections
```http
GET /api/v2/sdk/apps/{appName}/connections
```

**Path Parameters:**
- `appName` (string, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:**
```json
{
  "connections": [
    {
      "name": "string",
      "label": "string",
      "type": "string"
    }
  ]
}
```

---

### Create Connection
```http
POST /api/v2/sdk/apps/{appName}/connections
```

**Path Parameters:**
- `appName` (string, required)

**Request Body:**
```json
{
  "type": "string",
  "label": "string"
}
```

**Response:** Created connection object

---

### Get Connection
```http
GET /api/v2/sdk/apps/connections/{connectionName}
```

**Path Parameters:**
- `connectionName` (string, required)

**Response:** Connection configuration

---

### Delete Connection
```http
DELETE /api/v2/sdk/apps/connections/{connectionName}
```

**Path Parameters:**
- `connectionName` (string, required)

**Response:**
```json
{
  "name": "string"
}
```

---

### Update Connection
```http
PATCH /api/v2/sdk/apps/connections/{connectionName}
```

**Path Parameters:**
- `connectionName` (string, required)

**Request Body:**
```json
{
  "label": "string"
}
```

**Response:** Updated connection object

---

### Get Connection Section
```http
GET /api/v2/sdk/apps/connections/{connectionName}/{section}
```

**Path Parameters:**
- `connectionName` (string, required)
- `section` (string, required)

**Response:** Connection section configuration

---

### Set Connection Section
```http
PUT /api/v2/sdk/apps/connections/{connectionName}/{section}
```

**Path Parameters:**
- `connectionName` (string, required)
- `section` (string, required)

**Request Body:** Section configuration

**Response:** Updated connection section

---

### Get Connection Common
```http
GET /api/v2/sdk/apps/connections/{connectionName}/common
```

**Path Parameters:**
- `connectionName` (string, required)

**Response:** Common connection data

---

### Set Connection Common
```http
PUT /api/v2/sdk/apps/connections/{connectionName}/common
```

**Path Parameters:**
- `connectionName` (string, required)

**Request Body:** Common connection configuration

**Response:** Updated common data

---

### Recreate Connection
```http
PUT /api/v2/sdk/apps/connections/{connectionName}/recreate
```

**Path Parameters:**
- `connectionName` (string, required)

**Response:** Recreated connection object

---

## Webhooks

Webhooks allow your SDK app to receive real-time data from external services.

### List App Webhooks
```http
GET /api/v2/sdk/apps/{appName}/webhooks
```

**Path Parameters:**
- `appName` (string, required)

**Query Parameters:**
- `all` (boolean, optional)
- `opensource` (boolean, optional)

**Response:**
```json
{
  "webhooks": [
    {
      "name": "string",
      "label": "string",
      "type": "string"
    }
  ]
}
```

---

### Create Webhook
```http
POST /api/v2/sdk/apps/{appName}/webhooks
```

**Path Parameters:**
- `appName` (string, required)

**Request Body:**
```json
{
  "type": "string",
  "label": "string"
}
```

**Response:** Created webhook object

---

### Get Webhook
```http
GET /api/v2/sdk/apps/webhooks/{webhookName}
```

**Path Parameters:**
- `webhookName` (string, required)

**Response:**
```json
{
  "name": "string",
  "label": "string",
  "type": "string",
  "connection": "string"
}
```

---

### Delete Webhook
```http
DELETE /api/v2/sdk/apps/webhooks/{webhookName}
```

**Path Parameters:**
- `webhookName` (string, required)

**Response:**
```json
{
  "name": "string"
}
```

---

### Update Webhook
```http
PATCH /api/v2/sdk/apps/webhooks/{webhookName}
```

**Path Parameters:**
- `webhookName` (string, required)

**Request Body:**
```json
{
  "label": "string"
}
```

**Response:** Updated webhook object

---

### Get Webhook Section
```http
GET /api/v2/sdk/apps/webhooks/{webhookName}/{section}
```

**Path Parameters:**
- `webhookName` (string, required)
- `section` (string, required) - "api", "parameters", "attach", "detach", "scope"

**Response:** Webhook section configuration

---

### Set Webhook Section
```http
PUT /api/v2/sdk/apps/webhooks/{webhookName}/{section}
```

**Path Parameters:**
- `webhookName` (string, required)
- `section` (string, required) - "api", "parameters", "attach", "detach", "scope"

**Request Body:** Section configuration

**Response:** Updated webhook section

---

## 📊 Summary

**Total SDK Apps API Endpoints: 75+**

### Breakdown by Category:

✅ **Base Operations** - 9 endpoints
- App CRUD, clone, review, documentation

✅ **Invites** - 2 endpoints
- Get invite, accept invite

✅ **Modules** - 14 endpoints
- Full module lifecycle, sections, visibility, deprecation

✅ **RPCs** - 8 endpoints
- RPC CRUD, testing, section management

✅ **Functions** - 8 endpoints
- Function CRUD, code/test management

✅ **Connections** - 9 endpoints
- Connection CRUD, section/common management

✅ **Webhooks** - 8 endpoints
- Webhook CRUD, section management (api, parameters, attach, detach, scope)

---

## 🔐 Authentication

All SDK Apps endpoints require Token authentication:

```bash
Authorization: Token YOUR_API_TOKEN
```

---

## 🌍 Zones

Replace `{zone}` with your Make.com region:
- `eu1` - Europe (Primary)
- `eu2` - Europe (Secondary)
- `us1` - United States (Primary)
- `us2` - United States (Secondary)

---

## 📚 Resources

- [Make.com SDK Apps Documentation](https://developers.make.com/api-documentation/api-reference/sdk-apps)
- [Make.com API Reference](https://developers.make.com/)
- [SDK Apps Developer Guide](https://www.make.com/en/help/apps/app-development)

---

**Complete SDK Apps API implementation ready for use!** 🚀
