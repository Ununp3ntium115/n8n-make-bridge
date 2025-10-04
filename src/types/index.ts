// n8n Types
export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nConnections {
  [key: string]: {
    [key: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

// Make.com Types
export interface MakeScenario {
  id?: string;
  name: string;
  blueprint: MakeBlueprint;
  scheduling?: MakeScheduling;
  teamId?: string;
  organizationId?: string;
}

export interface MakeBlueprint {
  name: string;
  flow: MakeModule[];
  metadata?: Record<string, any>;
}

export interface MakeModule {
  id: number;
  module: string;
  version?: number;
  parameters?: Record<string, any>;
  mapper?: Record<string, any>;
  metadata?: {
    designer?: {
      x: number;
      y: number;
    };
  };
}

export interface MakeScheduling {
  type: 'indefinitely' | 'once' | 'custom';
  interval?: number;
  unit?: 'minutes' | 'hours' | 'days';
}

// Translation Types
export interface TranslationResult {
  success: boolean;
  data?: N8nWorkflow | MakeScenario;
  errors?: string[];
  warnings?: string[];
}

export interface TranslationContext {
  sourceType: 'n8n' | 'make';
  targetType: 'n8n' | 'make';
  options?: {
    preserveIds?: boolean;
    defaultActive?: boolean;
    teamId?: string;
    organizationId?: string;
  };
}
