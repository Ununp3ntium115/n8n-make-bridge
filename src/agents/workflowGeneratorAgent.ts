import { N8nWorkflow, N8nNode, N8nConnections, MakeScenario, MakeBlueprint, MakeModule, TranslationResult } from '../types';
import { BUSINESS_API_MAPPINGS, getN8nNodeType, getMakeModuleType } from '../types/businessApis';
import { WORKFLOW_TEMPLATES, findTemplatesByKeyword } from '../templates/workflowTemplates';

/**
 * AI-powered workflow generator that creates workflows from natural language
 */
export class WorkflowGeneratorAgent {

  /**
   * Generate a workflow from a natural language description
   */
  async generateFromDescription(
    description: string,
    platform: 'n8n' | 'make'
  ): Promise<TranslationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse the description to extract intent
      const intent = this.parseIntent(description);

      // Find matching template if available
      const templates = findTemplatesByKeyword(intent.keywords.join(' '));

      if (templates.length > 0) {
        // Use template as base
        const template = templates[0];
        warnings.push(`Using template: ${template.name}`);

        if (platform === 'n8n') {
          const workflow = this.customizeN8nTemplate(template.n8nTemplate as any, intent);
          return {
            success: true,
            data: workflow,
            warnings,
          };
        } else {
          const scenario = this.customizeMakeTemplate(template.makeTemplate as any, intent);
          return {
            success: true,
            data: scenario,
            warnings,
          };
        }
      }

      // Generate from scratch
      if (platform === 'n8n') {
        const workflow = this.generateN8nWorkflow(intent);
        return {
          success: true,
          data: workflow,
          warnings,
        };
      } else {
        const scenario = this.generateMakeScenario(intent);
        return {
          success: true,
          data: scenario,
          warnings,
        };
      }
    } catch (error) {
      errors.push(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        errors,
      };
    }
  }

  /**
   * Generate workflow from a specific template
   */
  async generateFromTemplate(
    templateId: string,
    platform: 'n8n' | 'make',
    customizations?: any
  ): Promise<TranslationResult> {
    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
      return {
        success: false,
        errors: [`Template not found: ${templateId}`],
      };
    }

    const intent = {
      action: templateId,
      services: template.requiredServices,
      keywords: template.keywords,
      trigger: 'schedule',
      actions: [],
      customizations,
    };

    if (platform === 'n8n') {
      return {
        success: true,
        data: this.customizeN8nTemplate(template.n8nTemplate as any, intent),
      };
    } else {
      return {
        success: true,
        data: this.customizeMakeTemplate(template.makeTemplate as any, intent),
      };
    }
  }

  /**
   * Parse natural language description into structured intent
   */
  private parseIntent(description: string): {
    action: string;
    services: string[];
    keywords: string[];
    trigger: string;
    actions: string[];
    customizations?: any;
  } {
    const lowerDesc = description.toLowerCase();
    const services: string[] = [];
    const keywords: string[] = [];

    // Detect services mentioned
    Object.keys(BUSINESS_API_MAPPINGS).forEach(serviceKey => {
      const service = BUSINESS_API_MAPPINGS[serviceKey];
      if (lowerDesc.includes(service.name.toLowerCase()) || lowerDesc.includes(serviceKey)) {
        services.push(serviceKey);
        keywords.push(serviceKey);
      }
    });

    // Detect trigger type
    let trigger = 'webhook';
    if (lowerDesc.includes('schedule') || lowerDesc.includes('daily') || lowerDesc.includes('hourly')) {
      trigger = 'schedule';
    } else if (lowerDesc.includes('email') || lowerDesc.includes('gmail') || lowerDesc.includes('outlook')) {
      trigger = 'email';
    } else if (lowerDesc.includes('webhook') || lowerDesc.includes('api')) {
      trigger = 'webhook';
    }

    // Detect action verbs
    const actions: string[] = [];
    const actionVerbs = ['send', 'create', 'update', 'delete', 'read', 'fetch', 'process', 'analyze', 'summarize', 'extract'];
    actionVerbs.forEach(verb => {
      if (lowerDesc.includes(verb)) {
        actions.push(verb);
        keywords.push(verb);
      }
    });

    // Detect AI-related keywords
    if (lowerDesc.includes('ai') || lowerDesc.includes('summarize') || lowerDesc.includes('analyze') || lowerDesc.includes('generate')) {
      if (!services.includes('openai') && !services.includes('anthropic_claude')) {
        services.push('openai');
      }
      keywords.push('ai');
    }

    return {
      action: actions[0] || 'process',
      services,
      keywords,
      trigger,
      actions,
    };
  }

  /**
   * Generate n8n workflow from intent
   */
  private generateN8nWorkflow(intent: any): N8nWorkflow {
    const nodes: N8nNode[] = [];
    const connections: N8nConnections = {};
    let xPos = 250;

    // Create trigger node
    const triggerNode = this.createN8nTriggerNode(intent.trigger, xPos);
    nodes.push(triggerNode);
    xPos += 250;

    // Create service nodes based on detected services
    let previousNodeId = triggerNode.id;

    intent.services.forEach((service: string, index: number) => {
      const serviceNode: N8nNode = {
        id: `${service}_${index}`,
        name: BUSINESS_API_MAPPINGS[service]?.name || service,
        type: getN8nNodeType(service),
        typeVersion: 1,
        position: [xPos, 300],
        parameters: this.getDefaultN8nParameters(service, intent.actions[0]),
      };

      nodes.push(serviceNode);

      // Connect to previous node
      connections[previousNodeId] = {
        main: [{ node: serviceNode.id, type: 'main', index: 0 }],
      };

      previousNodeId = serviceNode.id;
      xPos += 250;
    });

    return {
      name: this.generateWorkflowName(intent),
      active: false,
      nodes,
      connections,
      settings: {},
      staticData: {},
      tags: intent.keywords,
    };
  }

  /**
   * Generate Make scenario from intent
   */
  private generateMakeScenario(intent: any): MakeScenario {
    const modules: MakeModule[] = [];
    let moduleId = 1;
    let xPos = 250;

    // Create trigger module
    const triggerModule: MakeModule = {
      id: moduleId++,
      module: 'webhook',
      version: 1,
      parameters: {},
      metadata: {
        designer: { x: xPos, y: 300 },
      },
    };
    modules.push(triggerModule);
    xPos += 250;

    // Create service modules
    intent.services.forEach((service: string) => {
      const serviceModule: MakeModule = {
        id: moduleId++,
        module: getMakeModuleType(service),
        version: 1,
        parameters: this.getDefaultMakeParameters(service, intent.actions[0]),
        metadata: {
          designer: { x: xPos, y: 300 },
        },
      };
      modules.push(serviceModule);
      xPos += 250;
    });

    const blueprint: MakeBlueprint = {
      name: this.generateWorkflowName(intent),
      flow: modules,
    };

    return {
      name: this.generateWorkflowName(intent),
      blueprint,
    };
  }

  /**
   * Create n8n trigger node based on type
   */
  private createN8nTriggerNode(triggerType: string, xPos: number): N8nNode {
    const triggers: Record<string, { type: string; name: string }> = {
      schedule: { type: 'n8n-nodes-base.scheduleTrigger', name: 'Schedule' },
      email: { type: 'n8n-nodes-base.gmailTrigger', name: 'Email Trigger' },
      webhook: { type: 'n8n-nodes-base.webhook', name: 'Webhook' },
    };

    const trigger = triggers[triggerType] || triggers.webhook;

    return {
      id: 'trigger',
      name: trigger.name,
      type: trigger.type,
      typeVersion: 1,
      position: [xPos, 300],
      parameters: {},
    };
  }

  /**
   * Get default n8n parameters for a service
   */
  private getDefaultN8nParameters(service: string, action?: string): Record<string, any> {
    // Return sensible defaults based on service and action
    const defaults: Record<string, any> = {};

    if (service === 'openai' || service === 'anthropic_claude') {
      defaults.operation = 'message';
      defaults.messages = {
        values: [{
          role: 'user',
          content: '{{$json.content}}',
        }],
      };
    }

    return defaults;
  }

  /**
   * Get default Make parameters for a service
   */
  private getDefaultMakeParameters(service: string, action?: string): Record<string, any> {
    return {};
  }

  /**
   * Customize n8n template with intent
   */
  private customizeN8nTemplate(template: Partial<N8nWorkflow>, intent: any): N8nWorkflow {
    const workflow = { ...template } as N8nWorkflow;

    if (intent.customizations) {
      // Apply customizations to nodes
      workflow.nodes?.forEach(node => {
        if (intent.customizations[node.name]) {
          node.parameters = { ...node.parameters, ...intent.customizations[node.name] };
        }
      });
    }

    return workflow;
  }

  /**
   * Customize Make template with intent
   */
  private customizeMakeTemplate(template: Partial<MakeScenario>, intent: any): MakeScenario {
    const scenario = { ...template } as MakeScenario;

    if (intent.customizations && scenario.blueprint?.flow) {
      // Apply customizations to modules
      scenario.blueprint.flow.forEach(module => {
        if (intent.customizations[module.module]) {
          module.parameters = { ...module.parameters, ...intent.customizations[module.module] };
        }
      });
    }

    return scenario;
  }

  /**
   * Generate workflow name from intent
   */
  private generateWorkflowName(intent: any): string {
    const action = intent.action || 'Automation';
    const services = intent.services.slice(0, 2).map((s: string) =>
      BUSINESS_API_MAPPINGS[s]?.name || s
    ).join(' + ');

    return `${action.charAt(0).toUpperCase() + action.slice(1)}: ${services}`;
  }
}
