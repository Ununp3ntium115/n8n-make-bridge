import { MakeScenario, MakeModule, N8nWorkflow, N8nNode, N8nConnections, TranslationResult, TranslationContext } from '../types';

export class MakeToN8nAgent {
  /**
   * Translate a Make scenario to an n8n workflow
   */
  async translate(scenario: MakeScenario, context?: TranslationContext): Promise<TranslationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Extract blueprint
      const { blueprint } = scenario;

      // Convert Make modules to n8n nodes
      const nodes: N8nNode[] = [];
      const connections: N8nConnections = {};
      const moduleIdMap = new Map<number, string>();

      // First pass: Create nodes
      blueprint.flow.forEach((module, index) => {
        const nodeId = `node_${index}`;
        moduleIdMap.set(module.id, nodeId);

        const node: N8nNode = {
          id: nodeId,
          name: this.extractNodeName(module),
          type: this.mapModuleToNodeType(module.module),
          typeVersion: module.version || 1,
          position: this.extractPosition(module, index),
          parameters: this.mapParameters(module.parameters || {}, module.mapper || {}),
        };

        nodes.push(node);
      });

      // Second pass: Create connections
      blueprint.flow.forEach((module, index) => {
        const nodeId = moduleIdMap.get(module.id);
        if (!nodeId) return;

        // Make modules typically connect sequentially
        if (index < blueprint.flow.length - 1) {
          const nextModule = blueprint.flow[index + 1];
          const nextNodeId = moduleIdMap.get(nextModule.id);

          if (nextNodeId) {
            if (!connections[nodeId]) {
              connections[nodeId] = {};
            }
            connections[nodeId]['main'] = [{
              node: nextNodeId,
              type: 'main',
              index: 0,
            }];
          }
        }
      });

      const workflow: N8nWorkflow = {
        name: scenario.name || blueprint.name,
        active: context?.options?.defaultActive !== undefined ? context.options.defaultActive : false,
        nodes,
        connections,
        settings: {},
        staticData: {},
        tags: [],
      };

      if (errors.length > 0) {
        warnings.push('Some modules could not be fully translated');
      }

      return {
        success: true,
        data: workflow,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        errors,
      };
    }
  }

  /**
   * Extract node name from Make module
   */
  private extractNodeName(module: MakeModule): string {
    // Try to extract a meaningful name from the module
    const moduleName = module.module.split('.').pop() || module.module;
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  }

  /**
   * Map Make module type to n8n node type
   */
  private mapModuleToNodeType(moduleType: string): string {
    // This is a simplified mapping - in practice, you'd need a comprehensive mapping table
    const mappings: Record<string, string> = {
      'http': 'n8n-nodes-base.httpRequest',
      'webhook': 'n8n-nodes-base.webhook',
      'gmail': 'n8n-nodes-base.gmail',
      'googleSheets': 'n8n-nodes-base.googleSheets',
      'slack': 'n8n-nodes-base.slack',
      'airtable': 'n8n-nodes-base.airtable',
      'notion': 'n8n-nodes-base.notion',
      // Add more mappings as needed
    };

    // Extract base service name from Make module type (e.g., "google.gmail" -> "gmail")
    const baseName = moduleType.split('.').pop()?.toLowerCase() || moduleType.toLowerCase();

    return mappings[baseName] || 'n8n-nodes-base.httpRequest'; // Default to HTTP Request
  }

  /**
   * Extract position from Make module metadata
   */
  private extractPosition(module: MakeModule, index: number): [number, number] {
    if (module.metadata?.designer) {
      return [module.metadata.designer.x, module.metadata.designer.y];
    }
    // Default positioning in a horizontal line
    return [250 * index, 300];
  }

  /**
   * Map Make parameters to n8n parameters
   */
  private mapParameters(parameters: Record<string, any>, mapper: Record<string, any>): Record<string, any> {
    // Combine parameters and mapper
    // In Make, mapper often contains the actual field mappings
    return {
      ...parameters,
      ...mapper,
    };
  }

  /**
   * Batch translate multiple scenarios
   */
  async translateBatch(scenarios: MakeScenario[], context?: TranslationContext): Promise<TranslationResult[]> {
    return Promise.all(scenarios.map(scenario => this.translate(scenario, context)));
  }
}
