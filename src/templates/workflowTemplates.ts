import { N8nWorkflow, MakeScenario } from '../types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  n8nTemplate: Partial<N8nWorkflow>;
  makeTemplate: Partial<MakeScenario>;
  requiredServices: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'email_ai_summary',
    name: 'AI Email Summarizer',
    description: 'Automatically summarize incoming emails using AI and send summaries to Slack',
    category: 'productivity',
    keywords: ['email', 'ai', 'summary', 'slack', 'automation'],
    requiredServices: ['gmail', 'openai', 'slack'],
    n8nTemplate: {
      name: 'AI Email Summarizer',
      nodes: [
        {
          id: 'gmail_trigger',
          name: 'Gmail Trigger',
          type: 'n8n-nodes-base.gmailTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            event: 'messageReceived',
          },
        },
        {
          id: 'openai',
          name: 'Summarize with OpenAI',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            operation: 'message',
            model: 'gpt-4',
            messages: {
              values: [{
                role: 'user',
                content: 'Summarize this email in 2-3 sentences: {{$json.snippet}}',
              }],
            },
          },
        },
        {
          id: 'slack',
          name: 'Send to Slack',
          type: 'n8n-nodes-base.slack',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'post',
            channel: '#email-summaries',
            text: '📧 Email Summary:\n{{$json.choices[0].message.content}}',
          },
        },
      ],
      connections: {
        'gmail_trigger': {
          'main': [{ node: 'openai', type: 'main', index: 0 }],
        },
        'openai': {
          'main': [{ node: 'slack', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
  {
    id: 'crm_lead_enrichment',
    name: 'CRM Lead Enrichment',
    description: 'Enrich new Salesforce leads with company data and notify sales team',
    category: 'sales',
    keywords: ['salesforce', 'crm', 'lead', 'enrichment', 'sales'],
    requiredServices: ['salesforce', 'http', 'slack'],
    n8nTemplate: {
      name: 'CRM Lead Enrichment',
      nodes: [
        {
          id: 'salesforce_trigger',
          name: 'New Lead in Salesforce',
          type: 'n8n-nodes-base.salesforceTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            object: 'Lead',
            event: 'create',
          },
        },
        {
          id: 'enrich_data',
          name: 'Enrich Company Data',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            method: 'GET',
            url: 'https://api.clearbit.com/v2/companies/find',
            qs: {
              domain: '={{$json.Company}}',
            },
          },
        },
        {
          id: 'update_salesforce',
          name: 'Update Lead',
          type: 'n8n-nodes-base.salesforce',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'update',
            resource: 'lead',
            leadId: '={{$node["salesforce_trigger"].json.Id}}',
            updateFields: {
              Industry: '={{$json.category.industry}}',
              NumberOfEmployees: '={{$json.metrics.employees}}',
            },
          },
        },
        {
          id: 'notify_slack',
          name: 'Notify Sales Team',
          type: 'n8n-nodes-base.slack',
          typeVersion: 1,
          position: [1000, 300],
          parameters: {
            operation: 'post',
            channel: '#sales-leads',
            text: '🎯 New qualified lead: {{$node["salesforce_trigger"].json.Name}} from {{$node["salesforce_trigger"].json.Company}}',
          },
        },
      ],
      connections: {
        'salesforce_trigger': {
          'main': [{ node: 'enrich_data', type: 'main', index: 0 }],
        },
        'enrich_data': {
          'main': [{ node: 'update_salesforce', type: 'main', index: 0 }],
        },
        'update_salesforce': {
          'main': [{ node: 'notify_slack', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
  {
    id: 'expense_report_automation',
    name: 'Expense Report Automation',
    description: 'Process expense receipts from email, extract data with AI, and create QuickBooks expenses',
    category: 'finance',
    keywords: ['expense', 'receipt', 'quickbooks', 'ai', 'ocr'],
    requiredServices: ['gmail', 'openai', 'quickbooks'],
    n8nTemplate: {
      name: 'Expense Report Automation',
      nodes: [
        {
          id: 'gmail_trigger',
          name: 'Receipt Email',
          type: 'n8n-nodes-base.gmailTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            event: 'messageReceived',
            filters: {
              labelIds: ['INBOX'],
              subject: 'Receipt',
            },
          },
        },
        {
          id: 'extract_data',
          name: 'Extract Receipt Data',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            operation: 'message',
            model: 'gpt-4-vision',
            messages: {
              values: [{
                role: 'user',
                content: 'Extract: amount, vendor, date, category from this receipt image. Return as JSON.',
              }],
            },
          },
        },
        {
          id: 'create_expense',
          name: 'Create QuickBooks Expense',
          type: 'n8n-nodes-base.quickbooks',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'create',
            resource: 'expense',
            amount: '={{$json.amount}}',
            vendor: '={{$json.vendor}}',
            date: '={{$json.date}}',
            category: '={{$json.category}}',
          },
        },
      ],
      connections: {
        'gmail_trigger': {
          'main': [{ node: 'extract_data', type: 'main', index: 0 }],
        },
        'extract_data': {
          'main': [{ node: 'create_expense', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
  {
    id: 'customer_onboarding',
    name: 'Customer Onboarding Automation',
    description: 'Automate new customer onboarding: create accounts, send welcome emails, add to CRM',
    category: 'sales',
    keywords: ['customer', 'onboarding', 'crm', 'email', 'automation'],
    requiredServices: ['shopify', 'hubspot', 'microsoft_outlook'],
    n8nTemplate: {
      name: 'Customer Onboarding',
      nodes: [
        {
          id: 'shopify_trigger',
          name: 'New Customer',
          type: 'n8n-nodes-base.shopifyTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            topic: 'customers/create',
          },
        },
        {
          id: 'create_hubspot_contact',
          name: 'Add to HubSpot',
          type: 'n8n-nodes-base.hubspot',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            operation: 'create',
            resource: 'contact',
            email: '={{$json.email}}',
            firstname: '={{$json.first_name}}',
            lastname: '={{$json.last_name}}',
          },
        },
        {
          id: 'send_welcome_email',
          name: 'Send Welcome Email',
          type: 'n8n-nodes-base.microsoftOutlook',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'send',
            to: '={{$json.email}}',
            subject: 'Welcome to our platform!',
            bodyContent: 'Hi {{$json.first_name}}, welcome aboard!',
          },
        },
      ],
      connections: {
        'shopify_trigger': {
          'main': [{ node: 'create_hubspot_contact', type: 'main', index: 0 }],
        },
        'create_hubspot_contact': {
          'main': [{ node: 'send_welcome_email', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
  {
    id: 'social_media_content',
    name: 'AI Social Media Content Generator',
    description: 'Generate social media posts with AI based on blog content and schedule them',
    category: 'marketing',
    keywords: ['social', 'content', 'ai', 'marketing', 'automation'],
    requiredServices: ['http', 'anthropic_claude', 'airtable'],
    n8nTemplate: {
      name: 'AI Social Media Generator',
      nodes: [
        {
          id: 'schedule_trigger',
          name: 'Daily Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            rule: {
              interval: [{
                field: 'days',
                daysInterval: 1,
              }],
            },
          },
        },
        {
          id: 'get_blog_posts',
          name: 'Get Recent Blog Posts',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            method: 'GET',
            url: 'https://blog.example.com/api/posts/recent',
          },
        },
        {
          id: 'generate_social_post',
          name: 'Generate Post with Claude',
          type: 'n8n-nodes-base.anthropic',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'message',
            model: 'claude-3-5-sonnet-20241022',
            prompt: 'Create 3 engaging social media posts based on this blog: {{$json.title}}. Keep them under 280 characters.',
          },
        },
        {
          id: 'save_to_airtable',
          name: 'Save to Content Calendar',
          type: 'n8n-nodes-base.airtable',
          typeVersion: 1,
          position: [1000, 300],
          parameters: {
            operation: 'create',
            table: 'Content Calendar',
            fields: {
              Post: '={{$json.content}}',
              Status: 'Scheduled',
              Date: '={{$now}}',
            },
          },
        },
      ],
      connections: {
        'schedule_trigger': {
          'main': [{ node: 'get_blog_posts', type: 'main', index: 0 }],
        },
        'get_blog_posts': {
          'main': [{ node: 'generate_social_post', type: 'main', index: 0 }],
        },
        'generate_social_post': {
          'main': [{ node: 'save_to_airtable', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
  {
    id: 'invoice_processing',
    name: 'Automated Invoice Processing',
    description: 'Process invoices from email, extract data, and create records in accounting software',
    category: 'finance',
    keywords: ['invoice', 'accounting', 'ai', 'automation', 'finance'],
    requiredServices: ['microsoft_outlook', 'openai', 'quickbooks'],
    n8nTemplate: {
      name: 'Invoice Processing',
      nodes: [
        {
          id: 'outlook_trigger',
          name: 'Invoice Email',
          type: 'n8n-nodes-base.microsoftOutlookTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            event: 'messageReceived',
            folder: 'Invoices',
          },
        },
        {
          id: 'extract_invoice_data',
          name: 'Extract Invoice Data',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            operation: 'message',
            model: 'gpt-4',
            messages: {
              values: [{
                role: 'user',
                content: 'Extract invoice number, amount, vendor, due date from this invoice. Return as JSON.',
              }],
            },
          },
        },
        {
          id: 'create_quickbooks_bill',
          name: 'Create Bill in QuickBooks',
          type: 'n8n-nodes-base.quickbooks',
          typeVersion: 1,
          position: [750, 300],
          parameters: {
            operation: 'create',
            resource: 'bill',
            vendor: '={{$json.vendor}}',
            amount: '={{$json.amount}}',
            dueDate: '={{$json.due_date}}',
          },
        },
      ],
      connections: {
        'outlook_trigger': {
          'main': [{ node: 'extract_invoice_data', type: 'main', index: 0 }],
        },
        'extract_invoice_data': {
          'main': [{ node: 'create_quickbooks_bill', type: 'main', index: 0 }],
        },
      },
    },
    makeTemplate: {},
  },
];

/**
 * Find templates by keyword
 */
export function findTemplatesByKeyword(keyword: string): WorkflowTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(template =>
    template.keywords.some(k => k.includes(lowerKeyword)) ||
    template.name.toLowerCase().includes(lowerKeyword) ||
    template.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Find templates by category
 */
export function findTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(template =>
    template.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Find templates by required service
 */
export function findTemplatesByService(service: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(template =>
    template.requiredServices.includes(service.toLowerCase())
  );
}
