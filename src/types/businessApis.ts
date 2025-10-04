/**
 * Business API Integration Types and Mappings
 * Maps common business APIs to both n8n and Make.com module types
 */

export interface ApiMapping {
  name: string;
  n8nNodeType: string;
  makeModuleType: string;
  category: 'communication' | 'productivity' | 'ai' | 'crm' | 'ecommerce' | 'finance' | 'storage' | 'database';
  commonOperations: string[];
}

export const BUSINESS_API_MAPPINGS: Record<string, ApiMapping> = {
  // Microsoft Office 365 / Graph API
  'microsoft_outlook': {
    name: 'Microsoft Outlook',
    n8nNodeType: 'n8n-nodes-base.microsoftOutlook',
    makeModuleType: 'microsoft365.outlook',
    category: 'communication',
    commonOperations: ['send_email', 'read_email', 'create_event', 'update_event'],
  },
  'microsoft_teams': {
    name: 'Microsoft Teams',
    n8nNodeType: 'n8n-nodes-base.microsoftTeams',
    makeModuleType: 'microsoft365.teams',
    category: 'communication',
    commonOperations: ['send_message', 'create_channel', 'post_to_channel'],
  },
  'microsoft_excel': {
    name: 'Microsoft Excel',
    n8nNodeType: 'n8n-nodes-base.microsoftExcel',
    makeModuleType: 'microsoft365.excel',
    category: 'productivity',
    commonOperations: ['read_worksheet', 'write_worksheet', 'create_row', 'update_row'],
  },
  'microsoft_onedrive': {
    name: 'Microsoft OneDrive',
    n8nNodeType: 'n8n-nodes-base.microsoftOneDrive',
    makeModuleType: 'microsoft365.onedrive',
    category: 'storage',
    commonOperations: ['upload_file', 'download_file', 'list_files', 'delete_file'],
  },
  'microsoft_sharepoint': {
    name: 'Microsoft SharePoint',
    n8nNodeType: 'n8n-nodes-base.microsoftSharepoint',
    makeModuleType: 'microsoft365.sharepoint',
    category: 'productivity',
    commonOperations: ['create_list_item', 'update_list_item', 'read_list', 'upload_file'],
  },

  // AI Services
  'openai': {
    name: 'OpenAI',
    n8nNodeType: 'n8n-nodes-base.openAi',
    makeModuleType: 'openai',
    category: 'ai',
    commonOperations: ['chat_completion', 'text_completion', 'image_generation', 'embeddings', 'audio_transcription'],
  },
  'anthropic_claude': {
    name: 'Anthropic Claude',
    n8nNodeType: 'n8n-nodes-base.anthropic',
    makeModuleType: 'anthropic',
    category: 'ai',
    commonOperations: ['create_message', 'stream_message'],
  },

  // Google Workspace
  'gmail': {
    name: 'Gmail',
    n8nNodeType: 'n8n-nodes-base.gmail',
    makeModuleType: 'google.gmail',
    category: 'communication',
    commonOperations: ['send_email', 'search_email', 'read_email', 'add_label'],
  },
  'google_sheets': {
    name: 'Google Sheets',
    n8nNodeType: 'n8n-nodes-base.googleSheets',
    makeModuleType: 'google.sheets',
    category: 'productivity',
    commonOperations: ['append_row', 'update_row', 'read_sheet', 'create_sheet'],
  },
  'google_drive': {
    name: 'Google Drive',
    n8nNodeType: 'n8n-nodes-base.googleDrive',
    makeModuleType: 'google.drive',
    category: 'storage',
    commonOperations: ['upload_file', 'create_folder', 'share_file', 'search_files'],
  },
  'google_calendar': {
    name: 'Google Calendar',
    n8nNodeType: 'n8n-nodes-base.googleCalendar',
    makeModuleType: 'google.calendar',
    category: 'productivity',
    commonOperations: ['create_event', 'update_event', 'list_events', 'delete_event'],
  },

  // CRM & Sales
  'salesforce': {
    name: 'Salesforce',
    n8nNodeType: 'n8n-nodes-base.salesforce',
    makeModuleType: 'salesforce',
    category: 'crm',
    commonOperations: ['create_lead', 'update_opportunity', 'search_records', 'create_account'],
  },
  'hubspot': {
    name: 'HubSpot',
    n8nNodeType: 'n8n-nodes-base.hubspot',
    makeModuleType: 'hubspot',
    category: 'crm',
    commonOperations: ['create_contact', 'update_deal', 'create_company', 'add_to_list'],
  },

  // E-commerce
  'shopify': {
    name: 'Shopify',
    n8nNodeType: 'n8n-nodes-base.shopify',
    makeModuleType: 'shopify',
    category: 'ecommerce',
    commonOperations: ['create_order', 'update_product', 'create_customer', 'fulfill_order'],
  },
  'woocommerce': {
    name: 'WooCommerce',
    n8nNodeType: 'n8n-nodes-base.wooCommerce',
    makeModuleType: 'woocommerce',
    category: 'ecommerce',
    commonOperations: ['create_product', 'update_order', 'create_customer'],
  },

  // Finance & Accounting
  'quickbooks': {
    name: 'QuickBooks',
    n8nNodeType: 'n8n-nodes-base.quickbooks',
    makeModuleType: 'quickbooks',
    category: 'finance',
    commonOperations: ['create_invoice', 'create_customer', 'create_payment', 'get_reports'],
  },
  'stripe': {
    name: 'Stripe',
    n8nNodeType: 'n8n-nodes-base.stripe',
    makeModuleType: 'stripe',
    category: 'finance',
    commonOperations: ['create_customer', 'create_charge', 'create_subscription', 'refund_payment'],
  },

  // Communication
  'slack': {
    name: 'Slack',
    n8nNodeType: 'n8n-nodes-base.slack',
    makeModuleType: 'slack.slack',
    category: 'communication',
    commonOperations: ['send_message', 'create_channel', 'invite_user', 'upload_file'],
  },
  'discord': {
    name: 'Discord',
    n8nNodeType: 'n8n-nodes-base.discord',
    makeModuleType: 'discord',
    category: 'communication',
    commonOperations: ['send_message', 'create_channel', 'send_dm'],
  },
  'twilio': {
    name: 'Twilio',
    n8nNodeType: 'n8n-nodes-base.twilio',
    makeModuleType: 'twilio',
    category: 'communication',
    commonOperations: ['send_sms', 'make_call', 'send_whatsapp'],
  },

  // Databases
  'postgresql': {
    name: 'PostgreSQL',
    n8nNodeType: 'n8n-nodes-base.postgres',
    makeModuleType: 'postgresql',
    category: 'database',
    commonOperations: ['execute_query', 'insert', 'update', 'delete'],
  },
  'mysql': {
    name: 'MySQL',
    n8nNodeType: 'n8n-nodes-base.mysql',
    makeModuleType: 'mysql',
    category: 'database',
    commonOperations: ['execute_query', 'insert', 'update', 'delete'],
  },
  'mongodb': {
    name: 'MongoDB',
    n8nNodeType: 'n8n-nodes-base.mongoDb',
    makeModuleType: 'mongodb',
    category: 'database',
    commonOperations: ['find', 'insert', 'update', 'delete'],
  },

  // Productivity & Project Management
  'notion': {
    name: 'Notion',
    n8nNodeType: 'n8n-nodes-base.notion',
    makeModuleType: 'notion.notion',
    category: 'productivity',
    commonOperations: ['create_page', 'update_database', 'query_database', 'create_block'],
  },
  'airtable': {
    name: 'Airtable',
    n8nNodeType: 'n8n-nodes-base.airtable',
    makeModuleType: 'airtable.airtable',
    category: 'productivity',
    commonOperations: ['create_record', 'update_record', 'search_records', 'list_records'],
  },
  'asana': {
    name: 'Asana',
    n8nNodeType: 'n8n-nodes-base.asana',
    makeModuleType: 'asana',
    category: 'productivity',
    commonOperations: ['create_task', 'update_task', 'create_project', 'add_comment'],
  },
  'trello': {
    name: 'Trello',
    n8nNodeType: 'n8n-nodes-base.trello',
    makeModuleType: 'trello',
    category: 'productivity',
    commonOperations: ['create_card', 'update_card', 'create_board', 'add_checklist'],
  },

  // Storage & Files
  'dropbox': {
    name: 'Dropbox',
    n8nNodeType: 'n8n-nodes-base.dropbox',
    makeModuleType: 'dropbox',
    category: 'storage',
    commonOperations: ['upload_file', 'download_file', 'create_folder', 'share_link'],
  },
  'aws_s3': {
    name: 'AWS S3',
    n8nNodeType: 'n8n-nodes-base.awsS3',
    makeModuleType: 'aws.s3',
    category: 'storage',
    commonOperations: ['upload_file', 'download_file', 'list_objects', 'delete_object'],
  },

  // Development & DevOps
  'github': {
    name: 'GitHub',
    n8nNodeType: 'n8n-nodes-base.github',
    makeModuleType: 'github',
    category: 'productivity',
    commonOperations: ['create_issue', 'create_pr', 'create_repo', 'add_comment'],
  },
  'gitlab': {
    name: 'GitLab',
    n8nNodeType: 'n8n-nodes-base.gitlab',
    makeModuleType: 'gitlab',
    category: 'productivity',
    commonOperations: ['create_issue', 'create_merge_request', 'create_project'],
  },

  // Generic HTTP
  'http': {
    name: 'HTTP Request',
    n8nNodeType: 'n8n-nodes-base.httpRequest',
    makeModuleType: 'http',
    category: 'productivity',
    commonOperations: ['get', 'post', 'put', 'delete', 'patch'],
  },
};

/**
 * Get n8n node type from service name
 */
export function getN8nNodeType(serviceName: string): string {
  const mapping = BUSINESS_API_MAPPINGS[serviceName.toLowerCase()];
  return mapping?.n8nNodeType || 'n8n-nodes-base.httpRequest';
}

/**
 * Get Make module type from service name
 */
export function getMakeModuleType(serviceName: string): string {
  const mapping = BUSINESS_API_MAPPINGS[serviceName.toLowerCase()];
  return mapping?.makeModuleType || 'http';
}

/**
 * Get all available services by category
 */
export function getServicesByCategory(category: ApiMapping['category']): string[] {
  return Object.keys(BUSINESS_API_MAPPINGS).filter(
    key => BUSINESS_API_MAPPINGS[key].category === category
  );
}

/**
 * Search for services by keyword
 */
export function searchServices(keyword: string): string[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.keys(BUSINESS_API_MAPPINGS).filter(
    key => key.includes(lowerKeyword) ||
           BUSINESS_API_MAPPINGS[key].name.toLowerCase().includes(lowerKeyword)
  );
}
