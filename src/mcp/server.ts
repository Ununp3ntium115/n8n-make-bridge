#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nClient } from '../clients/n8nClient.js';
import { MakeClient } from '../clients/makeClient.js';
import { MakeToN8nAgent } from '../agents/makeToN8nAgent.js';
import { N8nToMakeAgent } from '../agents/n8nToMakeAgent.js';
import { WorkflowGeneratorAgent } from '../agents/workflowGeneratorAgent.js';
import { WorkflowModifierAgent } from '../agents/workflowModifierAgent.js';
import { BUSINESS_API_MAPPINGS, searchServices } from '../types/businessApis.js';
import { findTemplatesByKeyword } from '../templates/workflowTemplates.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MCP Server for n8n-Make Bridge
 * Exposes tools for AI assistants to generate and manage workflows
 */
class WorkflowBridgeMCPServer {
  private server: Server;
  private n8nClient: N8nClient | null = null;
  private makeClient: MakeClient | null = null;
  private makeToN8nAgent: MakeToN8nAgent;
  private n8nToMakeAgent: N8nToMakeAgent;
  private workflowGenerator: WorkflowGeneratorAgent;
  private workflowModifier: WorkflowModifierAgent;

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-make-workflow-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize agents
    this.makeToN8nAgent = new MakeToN8nAgent();
    this.n8nToMakeAgent = new N8nToMakeAgent();
    this.workflowGenerator = new WorkflowGeneratorAgent();
    this.workflowModifier = new WorkflowModifierAgent();

    // Initialize clients if credentials are available
    if (process.env.N8N_BASE_URL && process.env.N8N_API_KEY) {
      this.n8nClient = new N8nClient(
        process.env.N8N_BASE_URL,
        process.env.N8N_API_KEY
      );
    }

    if (process.env.MAKE_API_TOKEN) {
      this.makeClient = new MakeClient(
        process.env.MAKE_API_TOKEN,
        process.env.MAKE_REGION || 'eu1'
      );
    }

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'generate_workflow',
          description: 'Generate a workflow from natural language description. Supports both n8n and Make.com platforms.',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Natural language description of the desired workflow',
              },
              platform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Target platform (n8n or make)',
              },
              createWorkflow: {
                type: 'boolean',
                description: 'Whether to create the workflow on the platform immediately',
                default: false,
              },
            },
            required: ['description', 'platform'],
          },
        },
        {
          name: 'translate_workflow',
          description: 'Translate a workflow from one platform to another (n8n ↔ Make.com)',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow/scenario to translate',
              },
              sourcePlatform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Source platform',
              },
              targetPlatform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Target platform',
              },
              createWorkflow: {
                type: 'boolean',
                description: 'Whether to create the translated workflow on the target platform',
                default: false,
              },
            },
            required: ['workflowId', 'sourcePlatform', 'targetPlatform'],
          },
        },
        {
          name: 'search_templates',
          description: 'Search for pre-built workflow templates by keyword or category',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (keywords, category, or service name)',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'search_services',
          description: 'Search for available service integrations (APIs) that can be used in workflows',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Service keyword (e.g., "gmail", "salesforce", "ai")',
              },
            },
            required: ['keyword'],
          },
        },
        {
          name: 'list_workflows',
          description: 'List all workflows from n8n or scenarios from Make.com',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Platform to list workflows from',
              },
            },
            required: ['platform'],
          },
        },
        {
          name: 'get_workflow',
          description: 'Get details of a specific workflow/scenario',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow/scenario',
              },
              platform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Platform the workflow is on',
              },
            },
            required: ['workflowId', 'platform'],
          },
        },
        {
          name: 'create_business_automation',
          description: 'Create a complete business automation workflow based on common patterns (e.g., email automation, CRM sync, expense tracking)',
          inputSchema: {
            type: 'object',
            properties: {
              automationType: {
                type: 'string',
                enum: [
                  'email_summarizer',
                  'crm_lead_enrichment',
                  'expense_automation',
                  'customer_onboarding',
                  'social_media_content',
                  'invoice_processing',
                  'meeting_scheduler',
                  'data_backup',
                  'report_generation',
                ],
                description: 'Type of business automation to create',
              },
              platform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Target platform',
              },
              customizations: {
                type: 'object',
                description: 'Custom parameters for the automation (e.g., email addresses, channels, etc.)',
              },
            },
            required: ['automationType', 'platform'],
          },
        },
        {
          name: 'modify_workflow',
          description: 'Import and modify an existing workflow based on natural language instructions. Use this to add steps, remove nodes, change settings, or enhance existing workflows.',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow/scenario to modify',
              },
              platform: {
                type: 'string',
                enum: ['n8n', 'make'],
                description: 'Platform the workflow is on',
              },
              instructions: {
                type: 'string',
                description: 'Natural language instructions for how to modify the workflow (e.g., "add a Slack notification step at the end", "remove the OpenAI node", "change the workflow name to X")',
              },
              updateWorkflow: {
                type: 'boolean',
                description: 'Whether to update the workflow on the platform immediately',
                default: false,
              },
            },
            required: ['workflowId', 'platform', 'instructions'],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_workflow':
            return await this.handleGenerateWorkflow(args as any);

          case 'translate_workflow':
            return await this.handleTranslateWorkflow(args as any);

          case 'search_templates':
            return await this.handleSearchTemplates(args as any);

          case 'search_services':
            return await this.handleSearchServices(args as any);

          case 'list_workflows':
            return await this.handleListWorkflows(args as any);

          case 'get_workflow':
            return await this.handleGetWorkflow(args as any);

          case 'create_business_automation':
            return await this.handleCreateBusinessAutomation(args as any);

          case 'modify_workflow':
            return await this.handleModifyWorkflow(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async handleGenerateWorkflow(args: {
    description: string;
    platform: 'n8n' | 'make';
    createWorkflow?: boolean;
  }) {
    const result = await this.workflowGenerator.generateFromDescription(
      args.description,
      args.platform
    );

    let response = `Generated ${args.platform} workflow:\n\n`;
    response += `Name: ${result.data?.name || 'Untitled'}\n`;
    response += `Nodes/Modules: ${
      args.platform === 'n8n'
        ? (result.data as any)?.nodes?.length || 0
        : (result.data as any)?.blueprint?.flow?.length || 0
    }\n\n`;

    if (result.warnings && result.warnings.length > 0) {
      response += `Warnings:\n${result.warnings.join('\n')}\n\n`;
    }

    if (args.createWorkflow && result.success && result.data) {
      try {
        if (args.platform === 'n8n' && this.n8nClient) {
          const created = await this.n8nClient.createWorkflow(result.data as any);
          response += `✅ Workflow created in n8n with ID: ${created.id}`;
        } else if (args.platform === 'make' && this.makeClient) {
          const created = await this.makeClient.createScenario(result.data as any);
          response += `✅ Scenario created in Make.com with ID: ${created.id}`;
        }
      } catch (error) {
        response += `❌ Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
        {
          type: 'text',
          text: `Workflow JSON:\n${JSON.stringify(result.data, null, 2)}`,
        },
      ],
    };
  }

  private async handleTranslateWorkflow(args: {
    workflowId: string;
    sourcePlatform: 'n8n' | 'make';
    targetPlatform: 'n8n' | 'make';
    createWorkflow?: boolean;
  }) {
    let sourceData: any;
    let result: any;

    // Fetch source workflow
    if (args.sourcePlatform === 'n8n' && this.n8nClient) {
      sourceData = await this.n8nClient.getWorkflow(args.workflowId);
      result = await this.n8nToMakeAgent.translate(sourceData);
    } else if (args.sourcePlatform === 'make' && this.makeClient) {
      sourceData = await this.makeClient.getScenario(args.workflowId);
      const blueprint = await this.makeClient.getScenarioBlueprint(args.workflowId);
      sourceData.blueprint = blueprint;
      result = await this.makeToN8nAgent.translate(sourceData);
    } else {
      throw new Error(`${args.sourcePlatform} client not configured`);
    }

    let response = `Translated workflow from ${args.sourcePlatform} to ${args.targetPlatform}\n\n`;

    if (result.warnings && result.warnings.length > 0) {
      response += `Warnings:\n${result.warnings.join('\n')}\n\n`;
    }

    if (args.createWorkflow && result.success && result.data) {
      try {
        if (args.targetPlatform === 'n8n' && this.n8nClient) {
          const created = await this.n8nClient.createWorkflow(result.data);
          response += `✅ Workflow created in n8n with ID: ${created.id}`;
        } else if (args.targetPlatform === 'make' && this.makeClient) {
          const created = await this.makeClient.createScenario(result.data);
          response += `✅ Scenario created in Make.com with ID: ${created.id}`;
        }
      } catch (error) {
        response += `❌ Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  private async handleSearchTemplates(args: { query: string }) {
    const templates = findTemplatesByKeyword(args.query);

    let response = `Found ${templates.length} templates:\n\n`;
    templates.forEach(template => {
      response += `📋 ${template.name}\n`;
      response += `   ${template.description}\n`;
      response += `   Category: ${template.category}\n`;
      response += `   Services: ${template.requiredServices.join(', ')}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  private async handleSearchServices(args: { keyword: string }) {
    const services = searchServices(args.keyword);

    let response = `Found ${services.length} services matching "${args.keyword}":\n\n`;
    services.forEach(serviceKey => {
      const service = BUSINESS_API_MAPPINGS[serviceKey];
      response += `🔌 ${service.name}\n`;
      response += `   Category: ${service.category}\n`;
      response += `   Operations: ${service.commonOperations.join(', ')}\n\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  private async handleListWorkflows(args: { platform: 'n8n' | 'make' }) {
    if (args.platform === 'n8n' && this.n8nClient) {
      const workflows = await this.n8nClient.getWorkflows();
      let response = `Found ${workflows.length} n8n workflows:\n\n`;
      workflows.forEach(w => {
        response += `• ${w.name} (ID: ${w.id}) - ${w.active ? '✅ Active' : '⏸️ Inactive'}\n`;
      });
      return {
        content: [{ type: 'text', text: response }],
      };
    } else if (args.platform === 'make' && this.makeClient) {
      const scenarios = await this.makeClient.getScenarios();
      let response = `Found ${scenarios.length} Make.com scenarios:\n\n`;
      scenarios.forEach(s => {
        response += `• ${s.name} (ID: ${s.id})\n`;
      });
      return {
        content: [{ type: 'text', text: response }],
      };
    } else {
      throw new Error(`${args.platform} client not configured`);
    }
  }

  private async handleGetWorkflow(args: { workflowId: string; platform: 'n8n' | 'make' }) {
    if (args.platform === 'n8n' && this.n8nClient) {
      const workflow = await this.n8nClient.getWorkflow(args.workflowId);
      return {
        content: [
          {
            type: 'text',
            text: `Workflow: ${workflow.name}\nNodes: ${workflow.nodes.length}\nActive: ${workflow.active}\n\n${JSON.stringify(workflow, null, 2)}`,
          },
        ],
      };
    } else if (args.platform === 'make' && this.makeClient) {
      const scenario = await this.makeClient.getScenario(args.workflowId);
      return {
        content: [
          {
            type: 'text',
            text: `Scenario: ${scenario.name}\n\n${JSON.stringify(scenario, null, 2)}`,
          },
        ],
      };
    } else {
      throw new Error(`${args.platform} client not configured`);
    }
  }

  private async handleCreateBusinessAutomation(args: {
    automationType: string;
    platform: 'n8n' | 'make';
    customizations?: any;
  }) {
    const result = await this.workflowGenerator.generateFromTemplate(
      args.automationType,
      args.platform,
      args.customizations
    );

    return {
      content: [
        {
          type: 'text',
          text: `Created ${args.automationType} automation for ${args.platform}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async handleModifyWorkflow(args: {
    workflowId: string;
    platform: 'n8n' | 'make';
    instructions: string;
    updateWorkflow?: boolean;
  }) {
    try {
      let originalWorkflow: any;
      let result: any;

      // Fetch the original workflow
      if (args.platform === 'n8n' && this.n8nClient) {
        originalWorkflow = await this.n8nClient.getWorkflow(args.workflowId);
        result = await this.workflowModifier.modifyN8nWorkflow(
          originalWorkflow,
          args.instructions
        );
      } else if (args.platform === 'make' && this.makeClient) {
        originalWorkflow = await this.makeClient.getScenario(args.workflowId);
        const blueprint = await this.makeClient.getScenarioBlueprint(args.workflowId);
        originalWorkflow.blueprint = blueprint;
        result = await this.workflowModifier.modifyMakeScenario(
          originalWorkflow,
          args.instructions
        );
      } else {
        throw new Error(`${args.platform} client not configured`);
      }

      let response = `Modified workflow based on: "${args.instructions}"\n\n`;
      response += `Original: ${originalWorkflow.name}\n`;
      response += `Status: ${result.success ? '✅ Success' : '❌ Failed'}\n\n`;

      if (result.warnings && result.warnings.length > 0) {
        response += `Warnings:\n${result.warnings.join('\n')}\n\n`;
      }

      if (args.updateWorkflow && result.success && result.data) {
        try {
          if (args.platform === 'n8n' && this.n8nClient) {
            await this.n8nClient.updateWorkflow(args.workflowId, result.data);
            response += `✅ Workflow updated in n8n`;
          } else if (args.platform === 'make' && this.makeClient) {
            await this.makeClient.updateScenario(args.workflowId, result.data);
            response += `✅ Scenario updated in Make.com`;
          }
        } catch (error) {
          response += `❌ Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
          {
            type: 'text',
            text: `Modified Workflow:\n${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error modifying workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n-Make Workflow Bridge MCP Server running on stdio');
  }
}

// Start the server
const server = new WorkflowBridgeMCPServer();
server.run().catch(console.error);
