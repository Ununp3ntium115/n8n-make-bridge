import { N8nWorkflow, N8nNode, MakeScenario, MakeModule, MakeBlueprint, TranslationResult, TranslationContext } from '../types';

export class N8nToMakeAgent {
  /**
   * Translate an n8n workflow to a Make scenario
   */
  async translate(workflow: N8nWorkflow, context?: TranslationContext): Promise<TranslationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Convert n8n nodes to Make modules
      const modules: MakeModule[] = [];
      const nodeIdMap = new Map<string, number>();

      // First pass: Create modules
      workflow.nodes.forEach((node, index) => {
        const moduleId = index + 1;
        nodeIdMap.set(node.id, moduleId);

        const module: MakeModule = {
          id: moduleId,
          module: this.mapNodeTypeToModule(node.type),
          version: node.typeVersion,
          parameters: this.extractParameters(node.parameters),
          mapper: this.extractMapper(node.parameters),
          metadata: {
            designer: {
              x: node.position[0],
              y: node.position[1],
            },
          },
        };

        modules.push(module);
      });

      // Make uses a sequential flow model, so we need to order modules based on connections
      const orderedModules = this.orderModulesByConnections(modules, workflow, nodeIdMap);

      const blueprint: MakeBlueprint = {
        name: workflow.name,
        flow: orderedModules,
        metadata: {
          version: 1,
          scenario: workflow.name,
        },
      };

      const scenario: MakeScenario = {
        name: workflow.name,
        blueprint,
        teamId: context?.options?.teamId,
        organizationId: context?.options?.organizationId,
      };

      if (workflow.active) {
        scenario.scheduling = {
          type: 'indefinitely',
          interval: 15,
          unit: 'minutes',
        };
      }

      if (errors.length > 0) {
        warnings.push('Some nodes could not be fully translated');
      }

      return {
        success: true,
        data: scenario,
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
   * Map n8n node type to Make module type
   */
  private mapNodeTypeToModule(nodeType: string): string {
    // This is a simplified mapping - in practice, you'd need a comprehensive mapping table
    const mappings: Record<string, string> = {
      'n8n-nodes-base.httpRequest': 'http',
      'n8n-nodes-base.webhook': 'webhook',
      'n8n-nodes-base.gmail': 'google.gmail',
      'n8n-nodes-base.googleSheets': 'google.sheets',
      'n8n-nodes-base.slack': 'slack.slack',
      'n8n-nodes-base.airtable': 'airtable.airtable',
      'n8n-nodes-base.notion': 'notion.notion',
      // Add more mappings as needed
    };

    return mappings[nodeType] || 'http'; // Default to HTTP
  }

  /**
   * Extract parameters from n8n node
   */
  private extractParameters(parameters: Record<string, any>): Record<string, any> {
    // Filter out mapper-specific parameters
    const params: Record<string, any> = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (!this.isMapperField(key, value)) {
        params[key] = value;
      }
    }
    return params;
  }

  /**
   * Extract mapper from n8n node parameters
   */
  private extractMapper(parameters: Record<string, any>): Record<string, any> {
    // Extract fields that should be in the mapper
    const mapper: Record<string, any> = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (this.isMapperField(key, value)) {
        mapper[key] = value;
      }
    }
    return mapper;
  }

  /**
   * Check if a field should be in the mapper
   */
  private isMapperField(key: string, value: any): boolean {
    // Fields that contain expressions or mappings typically go in the mapper
    if (typeof value === 'string') {
      return value.includes('{{') || value.includes('$json') || value.includes('$node');
    }
    return false;
  }

  /**
   * Order modules based on n8n connections to create a sequential flow
   */
  private orderModulesByConnections(
    modules: MakeModule[],
    workflow: N8nWorkflow,
    nodeIdMap: Map<string, number>
  ): MakeModule[] {
    // Find the starting node (node with no incoming connections)
    const hasIncomingConnection = new Set<string>();

    for (const [nodeId, connections] of Object.entries(workflow.connections)) {
      for (const outputType of Object.values(connections)) {
        for (const connection of outputType as any[]) {
          hasIncomingConnection.add(connection.node);
        }
      }
    }

    const startNode = workflow.nodes.find(node => !hasIncomingConnection.has(node.id));

    if (!startNode) {
      // If no clear start, return modules as-is
      return modules;
    }

    // Build execution order using BFS
    const ordered: MakeModule[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      const moduleId = nodeIdMap.get(nodeId);
      if (moduleId !== undefined) {
        const module = modules.find(m => m.id === moduleId);
        if (module) ordered.push(module);
      }

      // Add connected nodes to queue
      const nodeConnections = workflow.connections[nodeId];
      if (nodeConnections) {
        for (const outputType of Object.values(nodeConnections)) {
          for (const connection of outputType as any[]) {
            if (!visited.has(connection.node)) {
              queue.push(connection.node);
            }
          }
        }
      }
    }

    // Add any remaining modules that weren't connected
    modules.forEach(module => {
      if (!ordered.find(m => m.id === module.id)) {
        ordered.push(module);
      }
    });

    return ordered;
  }

  /**
   * Batch translate multiple workflows
   */
  async translateBatch(workflows: N8nWorkflow[], context?: TranslationContext): Promise<TranslationResult[]> {
    return Promise.all(workflows.map(workflow => this.translate(workflow, context)));
  }
}
