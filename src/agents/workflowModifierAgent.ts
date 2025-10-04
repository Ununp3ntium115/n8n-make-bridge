import { N8nWorkflow, N8nNode, MakeScenario, MakeModule, TranslationResult } from '../types';
import { getN8nNodeType, getMakeModuleType } from '../types/businessApis';

/**
 * Agent for modifying existing workflows based on natural language instructions
 */
export class WorkflowModifierAgent {

  /**
   * Modify an n8n workflow based on instructions
   */
  async modifyN8nWorkflow(
    workflow: N8nWorkflow,
    instructions: string
  ): Promise<TranslationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const intent = this.parseModificationIntent(instructions);
      let modifiedWorkflow = { ...workflow };

      switch (intent.action) {
        case 'add_node':
          modifiedWorkflow = this.addNodeToN8n(modifiedWorkflow, intent);
          break;

        case 'remove_node':
          modifiedWorkflow = this.removeNodeFromN8n(modifiedWorkflow, intent);
          break;

        case 'modify_node':
          modifiedWorkflow = this.modifyNodeInN8n(modifiedWorkflow, intent);
          break;

        case 'add_step':
          modifiedWorkflow = this.addStepToN8n(modifiedWorkflow, intent);
          break;

        case 'rename':
          modifiedWorkflow.name = intent.newName || modifiedWorkflow.name;
          break;

        case 'activate':
          modifiedWorkflow.active = true;
          break;

        case 'deactivate':
          modifiedWorkflow.active = false;
          break;

        default:
          warnings.push(`Could not determine modification action from: ${instructions}`);
      }

      return {
        success: true,
        data: modifiedWorkflow,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push(`Modification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        errors,
      };
    }
  }

  /**
   * Modify a Make scenario based on instructions
   */
  async modifyMakeScenario(
    scenario: MakeScenario,
    instructions: string
  ): Promise<TranslationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const intent = this.parseModificationIntent(instructions);
      let modifiedScenario = { ...scenario };

      switch (intent.action) {
        case 'add_node':
        case 'add_step':
          modifiedScenario = this.addModuleToMake(modifiedScenario, intent);
          break;

        case 'remove_node':
          modifiedScenario = this.removeModuleFromMake(modifiedScenario, intent);
          break;

        case 'modify_node':
          modifiedScenario = this.modifyModuleInMake(modifiedScenario, intent);
          break;

        case 'rename':
          modifiedScenario.name = intent.newName || modifiedScenario.name;
          if (modifiedScenario.blueprint) {
            modifiedScenario.blueprint.name = intent.newName || modifiedScenario.blueprint.name;
          }
          break;

        default:
          warnings.push(`Could not determine modification action from: ${instructions}`);
      }

      return {
        success: true,
        data: modifiedScenario,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      errors.push(`Modification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        errors,
      };
    }
  }

  /**
   * Parse modification instructions into structured intent
   */
  private parseModificationIntent(instructions: string): any {
    const lowerInstructions = instructions.toLowerCase();

    // Determine action
    let action = 'unknown';
    if (lowerInstructions.includes('add') || lowerInstructions.includes('insert')) {
      action = lowerInstructions.includes('step') ? 'add_step' : 'add_node';
    } else if (lowerInstructions.includes('remove') || lowerInstructions.includes('delete')) {
      action = 'remove_node';
    } else if (lowerInstructions.includes('change') || lowerInstructions.includes('modify') || lowerInstructions.includes('update')) {
      action = 'modify_node';
    } else if (lowerInstructions.includes('rename')) {
      action = 'rename';
    } else if (lowerInstructions.includes('activate') || lowerInstructions.includes('enable')) {
      action = 'activate';
    } else if (lowerInstructions.includes('deactivate') || lowerInstructions.includes('disable')) {
      action = 'deactivate';
    }

    // Extract services mentioned
    const services: string[] = [];
    const serviceKeywords = [
      'gmail', 'slack', 'openai', 'claude', 'salesforce', 'hubspot',
      'shopify', 'quickbooks', 'stripe', 'notion', 'airtable', 'sheets',
      'outlook', 'teams', 'excel', 'onedrive', 'sharepoint'
    ];

    serviceKeywords.forEach(service => {
      if (lowerInstructions.includes(service)) {
        services.push(service);
      }
    });

    // Extract position information
    let position = 'end';
    if (lowerInstructions.includes('beginning') || lowerInstructions.includes('start') || lowerInstructions.includes('first')) {
      position = 'beginning';
    } else if (lowerInstructions.includes('after')) {
      position = 'after';
    } else if (lowerInstructions.includes('before')) {
      position = 'before';
    } else if (lowerInstructions.includes('middle')) {
      position = 'middle';
    }

    // Extract node names or IDs
    const nodeNameMatch = lowerInstructions.match(/node[s]?\s+['"](.*?)['"]/);
    const nodeName = nodeNameMatch ? nodeNameMatch[1] : null;

    // Extract new name for rename
    const renameMatch = lowerInstructions.match(/(?:rename|call it|name it)\s+['"](.*?)['"]/);
    const newName = renameMatch ? renameMatch[1] : null;

    // Extract operation/action verbs
    const operations = ['send', 'create', 'read', 'update', 'delete', 'fetch', 'post', 'get'];
    let operation = null;
    operations.forEach(op => {
      if (lowerInstructions.includes(op)) {
        operation = op;
      }
    });

    return {
      action,
      services,
      position,
      nodeName,
      newName,
      operation,
      rawInstructions: instructions,
    };
  }

  /**
   * Add a node to n8n workflow
   */
  private addNodeToN8n(workflow: N8nWorkflow, intent: any): N8nWorkflow {
    const newWorkflow = { ...workflow };
    const nodes = [...newWorkflow.nodes];
    const connections = { ...newWorkflow.connections };

    // Determine position
    let xPos = 250;
    let insertIndex = nodes.length;

    if (intent.position === 'beginning') {
      insertIndex = 1; // After trigger
      xPos = 500;
      // Shift existing nodes
      nodes.forEach(node => {
        node.position[0] += 250;
      });
    } else if (intent.position === 'middle') {
      insertIndex = Math.floor(nodes.length / 2);
      xPos = nodes[insertIndex]?.position[0] || 500;
    } else {
      // End
      const lastNode = nodes[nodes.length - 1];
      xPos = lastNode ? lastNode.position[0] + 250 : 250;
    }

    // Create new node based on detected service
    const service = intent.services[0] || 'http';
    const nodeId = `${service}_${Date.now()}`;

    const newNode: N8nNode = {
      id: nodeId,
      name: intent.nodeName || `${service} Node`,
      type: getN8nNodeType(service),
      typeVersion: 1,
      position: [xPos, 300],
      parameters: {},
    };

    // Insert node
    nodes.splice(insertIndex, 0, newNode);

    // Update connections
    if (insertIndex > 0 && insertIndex < nodes.length) {
      const previousNode = nodes[insertIndex - 1];
      const nextNode = nodes[insertIndex + 1];

      // Connect previous to new
      connections[previousNode.id] = {
        main: [{ node: nodeId, type: 'main', index: 0 }],
      };

      // Connect new to next (if exists)
      if (nextNode) {
        connections[nodeId] = {
          main: [{ node: nextNode.id, type: 'main', index: 0 }],
        };
      }
    }

    newWorkflow.nodes = nodes;
    newWorkflow.connections = connections;

    return newWorkflow;
  }

  /**
   * Add a complete step (with specific functionality) to n8n workflow
   */
  private addStepToN8n(workflow: N8nWorkflow, intent: any): N8nWorkflow {
    const newWorkflow = { ...workflow };
    const nodes = [...newWorkflow.nodes];
    const connections = { ...newWorkflow.connections };

    const service = intent.services[0] || 'http';
    const nodeId = `${service}_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const xPos = lastNode ? lastNode.position[0] + 250 : 500;

    const newNode: N8nNode = {
      id: nodeId,
      name: this.generateNodeName(service, intent.operation),
      type: getN8nNodeType(service),
      typeVersion: 1,
      position: [xPos, 300],
      parameters: this.generateNodeParameters(service, intent.operation, intent.rawInstructions),
    };

    nodes.push(newNode);

    // Connect to last node
    if (lastNode) {
      connections[lastNode.id] = {
        main: [{ node: nodeId, type: 'main', index: 0 }],
      };
    }

    newWorkflow.nodes = nodes;
    newWorkflow.connections = connections;

    return newWorkflow;
  }

  /**
   * Remove a node from n8n workflow
   */
  private removeNodeFromN8n(workflow: N8nWorkflow, intent: any): N8nWorkflow {
    const newWorkflow = { ...workflow };
    const nodes = [...newWorkflow.nodes];
    const connections = { ...newWorkflow.connections };

    // Find node to remove
    const nodeToRemove = nodes.find(
      node =>
        node.name.toLowerCase().includes(intent.nodeName?.toLowerCase() || '') ||
        intent.services.some(s => node.name.toLowerCase().includes(s))
    );

    if (!nodeToRemove) {
      return workflow; // Node not found
    }

    const nodeIndex = nodes.indexOf(nodeToRemove);

    // Reconnect neighboring nodes
    if (nodeIndex > 0 && nodeIndex < nodes.length - 1) {
      const previousNode = nodes[nodeIndex - 1];
      const nextNode = nodes[nodeIndex + 1];

      connections[previousNode.id] = {
        main: [{ node: nextNode.id, type: 'main', index: 0 }],
      };
    }

    // Remove node and its connections
    delete connections[nodeToRemove.id];
    nodes.splice(nodeIndex, 1);

    newWorkflow.nodes = nodes;
    newWorkflow.connections = connections;

    return newWorkflow;
  }

  /**
   * Modify an existing node in n8n workflow
   */
  private modifyNodeInN8n(workflow: N8nWorkflow, intent: any): N8nWorkflow {
    const newWorkflow = { ...workflow };

    // Find node to modify
    const nodeToModify = newWorkflow.nodes.find(
      node =>
        node.name.toLowerCase().includes(intent.nodeName?.toLowerCase() || '') ||
        intent.services.some(s => node.name.toLowerCase().includes(s))
    );

    if (!nodeToModify) {
      return workflow;
    }

    // Apply modifications
    if (intent.newName) {
      nodeToModify.name = intent.newName;
    }

    if (intent.operation) {
      nodeToModify.parameters = {
        ...nodeToModify.parameters,
        operation: intent.operation,
      };
    }

    return newWorkflow;
  }

  /**
   * Add module to Make scenario
   */
  private addModuleToMake(scenario: MakeScenario, intent: any): MakeScenario {
    const newScenario = { ...scenario };
    if (!newScenario.blueprint) {
      newScenario.blueprint = { name: scenario.name, flow: [] };
    }

    const modules = [...newScenario.blueprint.flow];
    const service = intent.services[0] || 'http';
    const lastModule = modules[modules.length - 1];
    const xPos = lastModule ? (lastModule.metadata?.designer?.x || 0) + 250 : 250;

    const newModule: MakeModule = {
      id: modules.length + 1,
      module: getMakeModuleType(service),
      version: 1,
      parameters: {},
      metadata: {
        designer: { x: xPos, y: 300 },
      },
    };

    modules.push(newModule);
    newScenario.blueprint.flow = modules;

    return newScenario;
  }

  /**
   * Remove module from Make scenario
   */
  private removeModuleFromMake(scenario: MakeScenario, intent: any): MakeScenario {
    const newScenario = { ...scenario };
    if (!newScenario.blueprint) return scenario;

    const modules = [...newScenario.blueprint.flow];
    const moduleToRemove = modules.find(
      m => intent.services.some(s => m.module.toLowerCase().includes(s))
    );

    if (moduleToRemove) {
      const index = modules.indexOf(moduleToRemove);
      modules.splice(index, 1);
      newScenario.blueprint.flow = modules;
    }

    return newScenario;
  }

  /**
   * Modify module in Make scenario
   */
  private modifyModuleInMake(scenario: MakeScenario, intent: any): MakeScenario {
    const newScenario = { ...scenario };
    if (!newScenario.blueprint) return scenario;

    const moduleToModify = newScenario.blueprint.flow.find(
      m => intent.services.some(s => m.module.toLowerCase().includes(s))
    );

    if (moduleToModify && intent.operation) {
      moduleToModify.parameters = {
        ...moduleToModify.parameters,
        operation: intent.operation,
      };
    }

    return newScenario;
  }

  /**
   * Generate node name based on service and operation
   */
  private generateNodeName(service: string, operation?: string): string {
    const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
    if (operation) {
      const opName = operation.charAt(0).toUpperCase() + operation.slice(1);
      return `${serviceName} - ${opName}`;
    }
    return serviceName;
  }

  /**
   * Generate node parameters based on context
   */
  private generateNodeParameters(service: string, operation?: string, context?: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract parameter hints from context
    if (context) {
      const lowerContext = context.toLowerCase();

      // Email/message content
      if (lowerContext.includes('message') || lowerContext.includes('text')) {
        const messageMatch = context.match(/['"](.*?)['"]/);
        if (messageMatch) {
          params.text = messageMatch[1];
        }
      }

      // Channel/destination
      if (lowerContext.includes('channel')) {
        const channelMatch = context.match(/channel\s+['"](#?\w+)['"]/);
        if (channelMatch) {
          params.channel = channelMatch[1];
        }
      }

      // Email addresses
      if (lowerContext.includes('email') || lowerContext.includes('to:')) {
        const emailMatch = context.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          params.to = emailMatch[0];
        }
      }
    }

    if (operation) {
      params.operation = operation;
    }

    return params;
  }
}
