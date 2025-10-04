# Example Workflows and Use Cases

This document provides real-world examples of business automations you can create with the n8n-Make Bridge.

## Table of Contents

1. [Email & Communication](#email--communication)
2. [CRM & Sales](#crm--sales)
3. [Finance & Accounting](#finance--accounting)
4. [E-commerce](#e-commerce)
5. [AI-Powered Automations](#ai-powered-automations)
6. [Data & Reporting](#data--reporting)

---

## Email & Communication

### 1. AI Email Summarizer

**Use Case**: Get daily digests of important emails summarized by AI

**Workflow**:
```
Gmail Trigger (label: Important)
  → OpenAI (summarize email)
    → Slack (post to #email-digest)
```

**Natural Language Command** (via MCP):
```
"Create a workflow that watches my Important emails in Gmail,
summarizes them with OpenAI, and posts to Slack #email-digest"
```

**Benefits**:
- Save time reading emails
- Never miss important updates
- Team-wide visibility

---

### 2. Support Ticket Automation

**Use Case**: Automatically categorize and route support emails

**Workflow**:
```
Outlook Trigger (folder: Support)
  → Claude AI (categorize urgency & topic)
    → Asana (create task)
      → Slack (notify team)
```

**Services Used**: Microsoft Outlook, Anthropic Claude, Asana, Slack

---

## CRM & Sales

### 3. Lead Enrichment Pipeline

**Use Case**: Automatically enrich new leads with company data

**Workflow**:
```
Salesforce Trigger (new lead)
  → Clearbit API (enrich company data)
    → Salesforce (update lead)
      → HubSpot (create contact)
        → Slack (notify sales team)
```

**ROI**: Saves 10-15 minutes per lead, improves conversion rates

---

### 4. Customer Onboarding Automation

**Use Case**: Automated welcome sequence for new customers

**Workflow**:
```
Shopify Trigger (new customer)
  → HubSpot (create contact)
    → Outlook (send welcome email)
      → Airtable (add to customer database)
        → Slack (notify success team)
```

**Natural Language Command**:
```
"Set up customer onboarding: when someone signs up on Shopify,
add them to HubSpot, send welcome email via Outlook,
save to Airtable, and notify team on Slack"
```

---

## Finance & Accounting

### 5. Expense Report Automation

**Use Case**: Process expense receipts automatically

**Workflow**:
```
Gmail Trigger (has attachment + subject: Receipt)
  → OpenAI Vision (extract: amount, vendor, date, category)
    → QuickBooks (create expense)
      → Google Sheets (log expense)
        → Slack (confirm to employee)
```

**Time Saved**: 20 minutes per expense report

---

### 6. Invoice Processing

**Use Case**: Auto-process vendor invoices

**Workflow**:
```
Outlook Trigger (folder: Invoices)
  → OpenAI (extract invoice data)
    → QuickBooks (create bill)
      → Asana (create approval task)
        → Slack (notify finance team)
```

**Natural Language Command**:
```
"Automate invoice processing: read invoices from Outlook,
extract data with AI, create bills in QuickBooks,
and get approval via Asana"
```

---

## E-commerce

### 7. Shopify Order Fulfillment

**Use Case**: Streamline order processing

**Workflow**:
```
Shopify Trigger (new order)
  → Google Sheets (log order)
    → Shipstation API (create shipment)
      → Shopify (update order status)
        → Gmail (send tracking to customer)
```

---

### 8. Inventory Alert System

**Use Case**: Monitor inventory across platforms

**Workflow**:
```
Schedule Trigger (daily 9am)
  → Shopify (get inventory levels)
    → Filter (stock < 10 items)
      → Airtable (update inventory sheet)
        → Slack (alert purchasing team)
          → QuickBooks (check reorder costs)
```

---

## AI-Powered Automations

### 9. Content Generation Pipeline

**Use Case**: AI-generated social media content from blog posts

**Workflow**:
```
RSS Trigger (blog feed)
  → Claude AI (generate 3 social posts)
    → Airtable (save to content calendar)
      → Buffer/Hootsuite (schedule posts)
        → Slack (notify marketing team)
```

**Natural Language Command**:
```
"Monitor our blog RSS feed, use Claude to create social media posts,
save them to Airtable content calendar, and notify marketing team"
```

---

### 10. Meeting Notes & Action Items

**Use Case**: Auto-generate meeting summaries and tasks

**Workflow**:
```
Google Calendar Trigger (meeting ended)
  → OpenAI Whisper (transcribe recording)
    → Claude AI (extract action items)
      → Notion (create meeting notes)
        → Asana (create tasks)
          → Slack (send summary)
```

---

### 11. Customer Feedback Analysis

**Use Case**: Analyze product reviews with AI

**Workflow**:
```
Webhook Trigger (new review)
  → Claude AI (analyze sentiment & extract themes)
    → Airtable (log analysis)
      → If negative → Slack (alert team)
      → If positive → Post to social media
```

---

## Data & Reporting

### 12. Daily Business Dashboard

**Use Case**: Automated daily reports

**Workflow**:
```
Schedule Trigger (daily 8am)
  → Shopify (get yesterday's sales)
    → Google Analytics (get traffic)
      → QuickBooks (get expenses)
        → OpenAI (generate insights)
          → Google Slides (update dashboard)
            → Slack (post report)
```

---

### 13. Multi-Platform Data Sync

**Use Case**: Keep data synchronized across tools

**Workflow**:
```
Salesforce Trigger (contact updated)
  → HubSpot (update contact)
    → Google Sheets (update CRM export)
      → Airtable (update master database)
        → Slack (confirm sync)
```

---

### 14. Backup Automation

**Use Case**: Daily backups of critical business data

**Workflow**:
```
Schedule Trigger (daily 2am)
  → Airtable (export all tables)
    → Google Sheets (export data)
      → Notion (export pages)
        → Compress files
          → AWS S3 (upload backup)
            → Slack (confirm backup)
```

---

## Advanced Multi-Step Workflows

### 15. Complete Sales Funnel Automation

**Workflow**:
```
Facebook Ads Webhook (new lead)
  → HubSpot (create contact)
    → OpenAI (score lead quality)
      → If high score:
        → Salesforce (create opportunity)
        → Slack (notify sales rep)
        → Outlook (send personalized email)
      → If low score:
        → HubSpot (add to nurture sequence)
```

---

### 16. Event Management System

**Workflow**:
```
Eventbrite Trigger (new registration)
  → Airtable (add attendee)
    → Outlook (send confirmation)
      → Slack (notify event team)
        → 1 week before event:
          → Outlook (send reminder)
          → SMS via Twilio (text reminder)
        → After event:
          → Survey via Typeform
          → Thank you email
```

---

## Industry-Specific Examples

### Healthcare Practice

**Patient Appointment Reminders**:
```
Google Calendar (appointment tomorrow)
  → Twilio SMS (send reminder)
    → If no confirmation after 2 hours
      → Call via Twilio
      → Log in Airtable
```

### Real Estate

**New Listing Notifications**:
```
MLS Webhook (new listing)
  → Filter (matches client criteria)
    → Gmail (send to client)
      → Google Sheets (log showing)
        → Calendar (schedule viewing)
```

### Legal Services

**Document Processing**:
```
Outlook (new contract received)
  → OpenAI (extract key terms)
    → Notion (create case file)
      → Calendar (schedule review)
        → Billing system (log hours)
```

---

## How to Use These Examples

### Via REST API:

```bash
curl -X POST http://localhost:3000/translate/make-to-n8n/batch \
  -H "Content-Type: application/json" \
  -d '{
    "createWorkflows": true,
    "templateId": "email_ai_summary"
  }'
```

### Via MCP with Claude:

Simply describe what you want:

```
"Set up the AI Email Summarizer from the examples"
```

or

```
"Create a workflow like the CRM Lead Enrichment example but use
our Salesforce and send notifications to Teams instead of Slack"
```

### Via Code:

```typescript
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';

const generator = new WorkflowGeneratorAgent();
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

## Tips for Creating Effective Workflows

1. **Start Simple**: Begin with 2-3 nodes, then expand
2. **Error Handling**: Always add error notification nodes
3. **Testing**: Test with sample data before going live
4. **Monitoring**: Set up success/failure notifications
5. **Documentation**: Use descriptive node names
6. **Security**: Never hardcode credentials
7. **Rate Limits**: Be aware of API rate limits
8. **Costs**: Monitor API usage costs (OpenAI, etc.)

---

## Common Patterns

### Pattern 1: Trigger → Process → Notify
Most workflows follow this pattern

### Pattern 2: Trigger → Enrich → Update → Notify
Common for CRM and data enrichment

### Pattern 3: Schedule → Fetch → Analyze → Report
Used for reporting and analytics

### Pattern 4: Trigger → AI Processing → Branch
Intelligent routing based on AI analysis

---

## Performance Tips

1. **Use Webhooks**: More efficient than polling
2. **Batch Operations**: Process multiple items together
3. **Conditional Logic**: Skip unnecessary steps
4. **Caching**: Store frequently used data
5. **Async Operations**: Use webhooks for long-running tasks

---

## Next Steps

1. Choose an example that fits your needs
2. Customize it with your specific services
3. Test it with sample data
4. Deploy and monitor
5. Iterate and improve

For more templates, use the MCP server's `search_templates` tool or explore the templates in `src/templates/workflowTemplates.ts`.
