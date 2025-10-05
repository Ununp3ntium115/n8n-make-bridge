import axios, { AxiosInstance, AxiosError } from 'axios';
import { MakeScenario, MakeBlueprint } from '../types';

/**
 * Make.com API Client
 *
 * API Structure: {zone_url}/api/{version}/{endpoint}
 * Example: https://eu1.make.com/api/v2/scenarios
 *
 * Authentication: Authorization: Token {token}
 *
 * Rate Limits:
 * - Core: 60/min
 * - Pro: 120/min
 * - Teams: 240/min
 * - Enterprise: 1000/min
 */
export class MakeClient {
  private client: AxiosInstance;
  private region: string;
  private rateLimitRemaining?: number;
  private rateLimitReset?: Date;

  constructor(apiToken: string, region: string = 'eu1') {
    this.region = region;

    // Validate zone URL
    const validZones = ['eu1', 'eu2', 'us1', 'us2'];
    if (!validZones.includes(region) && !region.includes('.make.')) {
      console.warn(`⚠️  Unusual Make.com region: ${region}. Valid zones: ${validZones.join(', ')}`);
    }

    this.client = axios.create({
      baseURL: `https://${region}.make.com/api/v2`,
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for rate limit tracking
    this.client.interceptors.response.use(
      (response) => {
        // Track rate limit headers if available
        if (response.headers['x-ratelimit-remaining']) {
          this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining']);
        }
        if (response.headers['x-ratelimit-reset']) {
          this.rateLimitReset = new Date(response.headers['x-ratelimit-reset']);
        }
        return response;
      },
      (error: AxiosError) => {
        // Handle rate limit errors
        if (error.response?.status === 429) {
          console.error('❌ Make.com API rate limit exceeded. Please try again later.');
        }
        throw error;
      }
    );
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      resetAt: this.rateLimitReset,
    };
  }

  /**
   * Get all scenarios for a team or organization
   */
  async getScenarios(teamId?: string, organizationId?: string): Promise<MakeScenario[]> {
    const params: any = {};
    if (teamId) params.teamId = teamId;
    if (organizationId) params.organizationId = organizationId;

    const response = await this.client.get('/scenarios', { params });
    return response.data.scenarios || response.data;
  }

  /**
   * Get a specific scenario by ID
   */
  async getScenario(scenarioId: string): Promise<MakeScenario> {
    const response = await this.client.get(`/scenarios/${scenarioId}`);
    return response.data;
  }

  /**
   * Get scenario blueprint
   */
  async getScenarioBlueprint(scenarioId: string, blueprintId?: string, draft?: boolean): Promise<MakeBlueprint> {
    const params: any = {};
    if (blueprintId) params.blueprintId = blueprintId;
    if (draft !== undefined) params.draft = draft;

    const response = await this.client.get(`/scenarios/${scenarioId}/blueprint`, { params });
    return response.data.blueprint || response.data;
  }

  /**
   * Create a new scenario
   */
  async createScenario(scenario: MakeScenario): Promise<MakeScenario> {
    const response = await this.client.post('/scenarios', scenario);
    return response.data;
  }

  /**
   * Update an existing scenario
   */
  async updateScenario(scenarioId: string, updates: Partial<MakeScenario>): Promise<MakeScenario> {
    const response = await this.client.patch(`/scenarios/${scenarioId}`, updates);
    return response.data;
  }

  /**
   * Delete a scenario
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    await this.client.delete(`/scenarios/${scenarioId}`);
  }

  /**
   * Start (activate) a scenario
   */
  async startScenario(scenarioId: string): Promise<void> {
    await this.client.post(`/scenarios/${scenarioId}/start`);
  }

  /**
   * Stop (deactivate) a scenario
   */
  async stopScenario(scenarioId: string): Promise<void> {
    await this.client.post(`/scenarios/${scenarioId}/stop`);
  }

  /**
   * Run a scenario manually
   */
  async runScenario(scenarioId: string, data?: any): Promise<any> {
    const response = await this.client.post(`/scenarios/${scenarioId}/run`, data);
    return response.data;
  }

  /**
   * Get all blueprint versions for a scenario
   */
  async getBlueprintVersions(scenarioId: string): Promise<any[]> {
    const response = await this.client.get(`/scenarios/${scenarioId}/blueprints`);
    return response.data.blueprints || response.data;
  }

  /**
   * Get current user information
   */
  async getMe(): Promise<any> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  /**
   * Get organization details
   */
  async getOrganization(organizationId: string): Promise<any> {
    const response = await this.client.get(`/organizations/${organizationId}`);
    return response.data;
  }

  /**
   * List data stores
   * @param teamId - Required team ID
   * @param sortDir - Sort direction: 'asc' or 'desc'
   * @param sortBy - Field to sort by (e.g., 'name')
   */
  async getDataStores(
    teamId: string,
    options?: {
      sortDir?: 'asc' | 'desc';
      sortBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    const params: any = { teamId };

    // Handle pagination parameters (pg[sortDir], pg[limit], etc.)
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;

    const response = await this.client.get('/data-stores', { params });
    return response.data;
  }

  /**
   * Create a data store
   */
  async createDataStore(data: {
    name: string;
    teamId: string;
    datastructureId?: number;
    maxSizeMB?: number;
  }): Promise<any> {
    const response = await this.client.post('/data-stores', data);
    return response.data;
  }

  /**
   * Get data store records
   */
  async getDataStoreRecords(
    dataStoreId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    const params: any = {};
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;

    const response = await this.client.get(`/data-stores/${dataStoreId}/data`, { params });
    return response.data;
  }

  /**
   * Add record to data store
   */
  async addDataStoreRecord(dataStoreId: string, data: any): Promise<any> {
    const response = await this.client.post(`/data-stores/${dataStoreId}/data`, data);
    return response.data;
  }

  /**
   * Get teams
   */
  async getTeams(organizationId?: string): Promise<any> {
    const params: any = {};
    if (organizationId) params.organizationId = organizationId;

    const response = await this.client.get('/teams', { params });
    return response.data.teams || response.data;
  }

  /**
   * Get connections
   */
  async getConnections(teamId?: string): Promise<any> {
    const params: any = {};
    if (teamId) params.teamId = teamId;

    const response = await this.client.get('/connections', { params });
    return response.data.connections || response.data;
  }

  /**
   * Get webhooks
   */
  async getWebhooks(teamId?: string): Promise<any> {
    const params: any = {};
    if (teamId) params.teamId = teamId;

    const response = await this.client.get('/hooks', { params });
    return response.data.hooks || response.data;
  }

  /**
   * Test if API connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // Data Structures
  // ============================================

  /**
   * List data structures
   */
  async getDataStructures(teamId: string): Promise<any> {
    const response = await this.client.get('/datastructures', { params: { teamId } });
    return response.data.datastructures || response.data;
  }

  /**
   * Get specific data structure
   */
  async getDataStructure(dataStructureId: string): Promise<any> {
    const response = await this.client.get(`/datastructures/${dataStructureId}`);
    return response.data;
  }

  /**
   * Create data structure
   */
  async createDataStructure(data: {
    name: string;
    teamId: string;
    spec: any[];
  }): Promise<any> {
    const response = await this.client.post('/datastructures', data);
    return response.data;
  }

  /**
   * Update data structure
   */
  async updateDataStructure(dataStructureId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/datastructures/${dataStructureId}`, data);
    return response.data;
  }

  /**
   * Delete data structure
   */
  async deleteDataStructure(dataStructureId: string): Promise<void> {
    await this.client.delete(`/datastructures/${dataStructureId}`);
  }

  // ============================================
  // Functions
  // ============================================

  /**
   * List functions
   */
  async getFunctions(teamId: string): Promise<any> {
    const response = await this.client.get('/functions', { params: { teamId } });
    return response.data.functions || response.data;
  }

  /**
   * Get specific function
   */
  async getFunction(functionId: string): Promise<any> {
    const response = await this.client.get(`/functions/${functionId}`);
    return response.data;
  }

  /**
   * Create function
   */
  async createFunction(data: {
    name: string;
    teamId: string;
    code: string;
  }): Promise<any> {
    const response = await this.client.post('/functions', data);
    return response.data;
  }

  /**
   * Update function
   */
  async updateFunction(functionId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/functions/${functionId}`, data);
    return response.data;
  }

  /**
   * Delete function
   */
  async deleteFunction(functionId: string): Promise<void> {
    await this.client.delete(`/functions/${functionId}`);
  }

  // ============================================
  // Keys (API Keys/Credentials)
  // ============================================

  /**
   * List keys
   */
  async getKeys(teamId: string): Promise<any> {
    const response = await this.client.get('/keys', { params: { teamId } });
    return response.data.keys || response.data;
  }

  /**
   * Get specific key
   */
  async getKey(keyId: string): Promise<any> {
    const response = await this.client.get(`/keys/${keyId}`);
    return response.data;
  }

  /**
   * Create key
   */
  async createKey(data: {
    name: string;
    teamId: string;
    type: string;
    data: any;
  }): Promise<any> {
    const response = await this.client.post('/keys', data);
    return response.data;
  }

  /**
   * Update key
   */
  async updateKey(keyId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/keys/${keyId}`, data);
    return response.data;
  }

  /**
   * Delete key
   */
  async deleteKey(keyId: string): Promise<void> {
    await this.client.delete(`/keys/${keyId}`);
  }

  // ============================================
  // Devices (Mobile/Desktop Apps)
  // ============================================

  /**
   * List devices
   */
  async getDevices(teamId: string): Promise<any> {
    const response = await this.client.get('/devices', { params: { teamId } });
    return response.data.devices || response.data;
  }

  /**
   * Get specific device
   */
  async getDevice(deviceId: string): Promise<any> {
    const response = await this.client.get(`/devices/${deviceId}`);
    return response.data;
  }

  /**
   * Delete device
   */
  async deleteDevice(deviceId: string): Promise<void> {
    await this.client.delete(`/devices/${deviceId}`);
  }

  // ============================================
  // Scenario Logs
  // ============================================

  /**
   * Get scenario execution logs
   */
  async getScenarioLogs(
    scenarioId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'success' | 'error' | 'warning';
    }
  ): Promise<any> {
    const params: any = {};
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;
    if (options?.status) params.status = options.status;

    const response = await this.client.get(`/scenarios/${scenarioId}/executions`, { params });
    return response.data;
  }

  /**
   * Get specific execution details
   */
  async getScenarioExecution(scenarioId: string, executionId: string): Promise<any> {
    const response = await this.client.get(`/scenarios/${scenarioId}/executions/${executionId}`);
    return response.data;
  }

  // ============================================
  // Team Members
  // ============================================

  /**
   * List team members
   */
  async getTeamMembers(teamId: string): Promise<any> {
    const response = await this.client.get(`/teams/${teamId}/users`);
    return response.data.users || response.data;
  }

  /**
   * Add team member
   */
  async addTeamMember(teamId: string, data: {
    userId: string;
    role: 'admin' | 'member' | 'viewer';
  }): Promise<any> {
    const response = await this.client.post(`/teams/${teamId}/users`, data);
    return response.data;
  }

  /**
   * Update team member role
   */
  async updateTeamMember(teamId: string, userId: string, role: string): Promise<any> {
    const response = await this.client.patch(`/teams/${teamId}/users/${userId}`, { role });
    return response.data;
  }

  /**
   * Remove team member
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await this.client.delete(`/teams/${teamId}/users/${userId}`);
  }

  // ============================================
  // Apps & Modules
  // ============================================

  /**
   * List available apps
   */
  async getApps(): Promise<any> {
    const response = await this.client.get('/apps');
    return response.data.apps || response.data;
  }

  /**
   * Get specific app
   */
  async getApp(appId: string): Promise<any> {
    const response = await this.client.get(`/apps/${appId}`);
    return response.data;
  }

  /**
   * List app modules
   */
  async getAppModules(appId: string): Promise<any> {
    const response = await this.client.get(`/apps/${appId}/modules`);
    return response.data.modules || response.data;
  }

  // ============================================
  // Templates
  // ============================================

  /**
   * List public templates
   */
  async getTemplates(options?: {
    category?: string;
    search?: string;
    limit?: number;
  }): Promise<any> {
    const params: any = {};
    if (options?.category) params.category = options.category;
    if (options?.search) params.search = options.search;
    if (options?.limit) params['pg[limit]'] = options.limit;

    const response = await this.client.get('/templates', { params });
    return response.data.templates || response.data;
  }

  /**
   * Get specific template
   */
  async getTemplate(templateId: string): Promise<any> {
    const response = await this.client.get(`/templates/${templateId}`);
    return response.data;
  }

  /**
   * Clone template to create scenario
   */
  async cloneTemplate(templateId: string, teamId: string, name?: string): Promise<any> {
    const response = await this.client.post(`/templates/${templateId}/clone`, {
      teamId,
      name: name || 'Cloned from template',
    });
    return response.data;
  }

  // ============================================
  // Organization Management
  // ============================================

  /**
   * List organizations
   */
  async getOrganizations(): Promise<any> {
    const response = await this.client.get('/organizations');
    return response.data.organizations || response.data;
  }

  /**
   * Update organization settings
   */
  async updateOrganization(organizationId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/organizations/${organizationId}`, data);
    return response.data;
  }

  /**
   * Get organization usage stats
   */
  async getOrganizationUsage(organizationId: string): Promise<any> {
    const response = await this.client.get(`/organizations/${organizationId}/usage`);
    return response.data;
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<any> {
    const response = await this.client.get(`/organizations/${organizationId}/users`);
    return response.data.users || response.data;
  }

  // ============================================
  // Webhooks (Advanced)
  // ============================================

  /**
   * Create webhook
   */
  async createWebhook(data: {
    name: string;
    teamId: string;
    url?: string;
  }): Promise<any> {
    const response = await this.client.post('/hooks', data);
    return response.data;
  }

  /**
   * Get specific webhook
   */
  async getWebhook(hookId: string): Promise<any> {
    const response = await this.client.get(`/hooks/${hookId}`);
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(hookId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/hooks/${hookId}`, data);
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(hookId: string): Promise<void> {
    await this.client.delete(`/hooks/${hookId}`);
  }

  // ============================================
  // Connections (Advanced)
  // ============================================

  /**
   * Get specific connection
   */
  async getConnection(connectionId: string): Promise<any> {
    const response = await this.client.get(`/connections/${connectionId}`);
    return response.data;
  }

  /**
   * Create connection
   */
  async createConnection(data: {
    name: string;
    teamId: string;
    accountName: string;
    accountType: string;
    accountId?: string;
  }): Promise<any> {
    const response = await this.client.post('/connections', data);
    return response.data;
  }

  /**
   * Update connection
   */
  async updateConnection(connectionId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/connections/${connectionId}`, data);
    return response.data;
  }

  /**
   * Delete connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await this.client.delete(`/connections/${connectionId}`);
  }

  /**
   * Test connection
   */
  async testConnectionEndpoint(connectionId: string): Promise<any> {
    const response = await this.client.post(`/connections/${connectionId}/test`);
    return response.data;
  }

  // ============================================
  // Variables (Team/Organization Variables)
  // ============================================

  /**
   * List variables
   */
  async getVariables(teamId: string): Promise<any> {
    const response = await this.client.get('/variables', { params: { teamId } });
    return response.data.variables || response.data;
  }

  /**
   * Create variable
   */
  async createVariable(data: {
    name: string;
    teamId: string;
    value: string;
  }): Promise<any> {
    const response = await this.client.post('/variables', data);
    return response.data;
  }

  /**
   * Update variable
   */
  async updateVariable(variableId: string, value: string): Promise<any> {
    const response = await this.client.patch(`/variables/${variableId}`, { value });
    return response.data;
  }

  /**
   * Delete variable
   */
  async deleteVariable(variableId: string): Promise<void> {
    await this.client.delete(`/variables/${variableId}`);
  }

  // ============================================
  // Affiliate (Commission Tracking)
  // ============================================

  /**
   * Get affiliate commission stats
   */
  async getAffiliateStats(options?: {
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string;
  }): Promise<any> {
    const params: any = {};
    if (options?.dateFrom) params.dateFrom = options.dateFrom;
    if (options?.dateTo) params.dateTo = options.dateTo;

    const response = await this.client.get('/affiliate/stats', { params });
    return response.data;
  }

  /**
   * Get affiliate commissions
   */
  async getAffiliateCommissions(options?: {
    statusId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const params: any = {};
    if (options?.statusId) params.statusId = options.statusId;
    if (options?.dateFrom) params.dateFrom = options.dateFrom;
    if (options?.dateTo) params.dateTo = options.dateTo;
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;

    const response = await this.client.get('/affiliate/commissions', { params });
    return response.data;
  }

  /**
   * Get affiliate commission info
   */
  async getAffiliateCommissionInfo(options?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const params: any = {};
    if (options?.dateFrom) params.dateFrom = options.dateFrom;
    if (options?.dateTo) params.dateTo = options.dateTo;

    const response = await this.client.get('/affiliate/commission-info', { params });
    return response.data;
  }

  /**
   * Request affiliate payout
   */
  async requestAffiliatePayout(): Promise<any> {
    const response = await this.client.post('/affiliate/payout-request');
    return response.data;
  }

  // ============================================
  // Agents (On-Premise Agents)
  // ============================================

  /**
   * List agents
   */
  async getAgents(organizationId: number): Promise<any> {
    const response = await this.client.get('/agents', {
      params: { organizationId }
    });
    return response.data;
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string, organizationId: number): Promise<any> {
    const response = await this.client.get(`/agents/${agentId}`, {
      params: { organizationId }
    });
    return response.data;
  }

  /**
   * Create agent
   */
  async createAgent(agentId: string, name: string, organizationId: number): Promise<any> {
    const response = await this.client.post(`/agents/${agentId}`,
      { name },
      { params: { organizationId } }
    );
    return response.data;
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, name: string, organizationId: number): Promise<any> {
    const response = await this.client.patch(`/agents/${agentId}`,
      { name },
      { params: { organizationId } }
    );
    return response.data;
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string, organizationId: number): Promise<any> {
    const response = await this.client.delete(`/agents/${agentId}`, {
      params: { organizationId }
    });
    return response.data;
  }

  // ============================================
  // AI Agents (Beta)
  // ============================================

  /**
   * Get AI agents
   */
  async getAIAgents(teamId: number): Promise<any> {
    const response = await this.client.get('/ai-agents/v1/agents', {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Create AI agent
   */
  async createAIAgent(teamId: number, data: {
    name: string;
    teamId: number;
    makeConnectionId: number;
    defaultModel: string;
    systemPrompt: string;
    llmConfig?: any;
    scenarios?: any[];
    historyConfig?: any;
    mcpConfigs?: any[];
    contexts?: any[];
    outputParserFormat?: any;
  }): Promise<any> {
    const response = await this.client.post('/ai-agents/v1/agents', data, {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Get AI agent by ID
   */
  async getAIAgent(agentId: string, teamId: number): Promise<any> {
    const response = await this.client.get(`/ai-agents/v1/agents/${agentId}`, {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Delete AI agent
   */
  async deleteAIAgent(agentId: string, teamId: number): Promise<void> {
    await this.client.delete(`/ai-agents/v1/agents/${agentId}`, {
      params: { teamId }
    });
  }

  /**
   * Update AI agent
   */
  async updateAIAgent(agentId: string, teamId: number, data: {
    name?: string;
    systemPrompt?: string;
    defaultModel?: string;
    llmConfig?: any;
    invocationConfig?: any;
    scenarios?: any[];
    historyConfig?: any;
    mcpConfigs?: any[];
    outputParserFormat?: any;
  }): Promise<void> {
    await this.client.patch(`/ai-agents/v1/agents/${agentId}`, data, {
      params: { teamId }
    });
  }

  /**
   * Run AI agent
   */
  async runAIAgent(agentId: string, teamId: number, data: {
    messages: any[];
    threadId?: string;
    callbackUrl?: string;
    config?: any;
  }): Promise<any> {
    const response = await this.client.post(`/ai-agents/v1/agents/${agentId}/run`, data, {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Run AI agent with streaming (SSE)
   */
  async runAIAgentStream(agentId: string, teamId: number, data: {
    messages: any[];
    threadId?: string;
    callbackUrl?: string;
    config?: any;
  }): Promise<any> {
    const response = await this.client.post(`/ai-agents/v1/agents/${agentId}/run/stream`, data, {
      params: { teamId },
      responseType: 'stream',
      headers: { 'Accept': 'text/event-stream' }
    });
    return response.data;
  }

  // ============================================
  // AI Agents - Context
  // ============================================

  /**
   * List AI agent contexts
   */
  async getAIAgentContexts(agentId: string, teamId: number): Promise<any> {
    const response = await this.client.get('/ai-agents/v1/contexts', {
      params: { agentId, teamId }
    });
    return response.data;
  }

  /**
   * Create AI agent context (file upload)
   */
  async createAIAgentContext(teamId: number, agentId: string, file: any): Promise<any> {
    const formData = new FormData();
    formData.append('agentId', agentId);
    formData.append('file', file);

    const response = await this.client.post('/ai-agents/v1/contexts', formData, {
      params: { teamId },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Delete AI agent context
   */
  async deleteAIAgentContext(contextId: string, teamId: number): Promise<void> {
    await this.client.delete(`/ai-agents/v1/contexts/${contextId}`, {
      params: { teamId }
    });
  }

  // ============================================
  // AI Agents - LLM Providers
  // ============================================

  /**
   * List LLM providers
   */
  async getLLMProviders(teamId: number): Promise<any> {
    const response = await this.client.get('/ai-agents/v1/llm-providers', {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Get LLM provider
   */
  async getLLMProvider(providerId: number, teamId: number): Promise<any> {
    const response = await this.client.get(`/ai-agents/v1/llm-providers/${providerId}`, {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * List models for LLM provider
   */
  async getLLMProviderModels(providerId: number, teamId: number): Promise<any> {
    const response = await this.client.get(`/ai-agents/v1/llm-providers/${providerId}/models`, {
      params: { teamId }
    });
    return response.data;
  }

  // ============================================
  // Analytics (Enterprise only)
  // ============================================

  /**
   * Get organization analytics
   */
  async getAnalytics(organizationId: number, options?: {
    teamId?: number | number[];
    folderId?: number | number[];
    status?: string | string[];
    dateFrom?: string; // ISO 8601
    dateTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    returnTotalCount?: boolean;
  }): Promise<any> {
    const params: any = {};

    if (options?.teamId) params.teamId = options.teamId;
    if (options?.folderId) params.folderId = options.folderId;
    if (options?.status) params.status = options.status;
    if (options?.dateFrom) params['timeframe[dateFrom]'] = options.dateFrom;
    if (options?.dateTo) params['timeframe[dateTo]'] = options.dateTo;
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;
    if (options?.returnTotalCount) params['pg[returnTotalCount]'] = options.returnTotalCount;

    const response = await this.client.get(`/analytics/${organizationId}`, { params });
    return response.data;
  }

  // ============================================
  // Audit Logs (Enterprise/Teams)
  // ============================================

  /**
   * List organization audit logs
   */
  async getOrganizationAuditLogs(organizationId: number, options?: {
    team?: string | number | string[] | number[];
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string;
    event?: string | string[];
    author?: string | number | string[] | number[];
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    returnTotalCount?: boolean;
  }): Promise<any> {
    const params: any = {};

    if (options?.team) params.team = options.team;
    if (options?.dateFrom) params.dateFrom = options.dateFrom;
    if (options?.dateTo) params.dateTo = options.dateTo;
    if (options?.event) params.event = options.event;
    if (options?.author) params.author = options.author;
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;
    if (options?.returnTotalCount) params['pg[returnTotalCount]'] = options.returnTotalCount;

    const response = await this.client.get(`/audit-logs/organization/${organizationId}`, { params });
    return response.data;
  }

  /**
   * Get organization audit log filters
   */
  async getOrganizationAuditLogFilters(organizationId: number): Promise<any> {
    const response = await this.client.get(`/audit-logs/organization/${organizationId}/filters`);
    return response.data;
  }

  /**
   * List team audit logs
   */
  async getTeamAuditLogs(teamId: number, options?: {
    dateFrom?: string;
    dateTo?: string;
    event?: string | string[];
    author?: string | number | string[] | number[];
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    returnTotalCount?: boolean;
  }): Promise<any> {
    const params: any = {};

    if (options?.dateFrom) params.dateFrom = options.dateFrom;
    if (options?.dateTo) params.dateTo = options.dateTo;
    if (options?.event) params.event = options.event;
    if (options?.author) params.author = options.author;
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;
    if (options?.returnTotalCount) params['pg[returnTotalCount]'] = options.returnTotalCount;

    const response = await this.client.get(`/audit-logs/team/${teamId}`, { params });
    return response.data;
  }

  /**
   * Get team audit log filters
   */
  async getTeamAuditLogFilters(teamId: number): Promise<any> {
    const response = await this.client.get(`/audit-logs/team/${teamId}/filters`);
    return response.data;
  }

  // ============================================
  // Cashier (Billing/Products)
  // ============================================

  /**
   * Get list of cashier products
   */
  async getCashierProducts(options?: {
    type?: 'PLAN' | 'EXTRA';
    includeInvisible?: boolean;
    relatedPriceId?: number;
    organizationId?: number;
  }): Promise<any> {
    const params: any = {};
    if (options?.type) params.type = options.type;
    if (options?.includeInvisible !== undefined) params.includeInvisible = options.includeInvisible;
    if (options?.relatedPriceId) params.relatedPriceId = options.relatedPriceId;
    if (options?.organizationId) params.organizationId = options.organizationId;

    const response = await this.client.get('/cashier/products', { params });
    return response.data;
  }

  /**
   * Get price detail
   */
  async getCashierPrice(priceId: number): Promise<any> {
    const response = await this.client.get(`/cashier/prices/${priceId}`);
    return response.data;
  }

  // ============================================
  // Connections (Enhanced)
  // ============================================

  /**
   * List updatable connection parameters
   */
  async getConnectionEditableSchema(connectionId: number): Promise<any> {
    const response = await this.client.get(`/connections/${connectionId}/editable-data-schema`);
    return response.data;
  }

  /**
   * Update connection data
   */
  async setConnectionData(connectionId: number, data: any): Promise<any> {
    const response = await this.client.post(`/connections/${connectionId}/set-data`, data);
    return response.data;
  }

  /**
   * Verify if connection is scoped
   */
  async isConnectionScoped(connectionId: number, scope: string[]): Promise<any> {
    const response = await this.client.post(`/connections/${connectionId}/scoped`, { scope });
    return response.data;
  }

  // ============================================
  // Custom Properties
  // ============================================

  /**
   * List custom property structures
   */
  async getCustomPropertyStructures(organizationId: number): Promise<any> {
    const response = await this.client.get('/custom-property-structures', {
      params: { organizationId }
    });
    return response.data;
  }

  /**
   * Create custom property structure
   */
  async createCustomPropertyStructure(data: {
    associatedType: string;
    belongerType: string;
    belongerId: number;
  }): Promise<any> {
    const response = await this.client.post('/custom-property-structures', data);
    return response.data;
  }

  /**
   * List custom property structure items
   */
  async getCustomPropertyStructureItems(
    customPropertyStructureId: number,
    options?: {
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    const params: any = {};
    if (options?.sortBy) params['pg[sortBy]'] = options.sortBy;
    if (options?.sortDir) params['pg[sortDir]'] = options.sortDir;
    if (options?.limit) params['pg[limit]'] = options.limit;
    if (options?.offset) params['pg[offset]'] = options.offset;

    const response = await this.client.get(
      `/custom-property-structures/${customPropertyStructureId}/custom-property-structure-items`,
      { params }
    );
    return response.data;
  }

  /**
   * Create custom property structure item
   */
  async createCustomPropertyStructureItem(
    customPropertyStructureId: number,
    data: {
      name: string;
      label: string;
      description: string;
      type: 'boolean' | 'number' | 'shortText' | 'longText' | 'date' | 'dropdown' | 'multiselect';
      options?: any;
      required?: boolean;
    }
  ): Promise<any> {
    const response = await this.client.post(
      `/custom-property-structures/${customPropertyStructureId}/custom-property-structure-items`,
      data
    );
    return response.data;
  }

  /**
   * Delete custom property structure item
   */
  async deleteCustomPropertyStructureItem(
    customPropertyStructureItemId: number,
    confirmed: boolean = false
  ): Promise<any> {
    const response = await this.client.delete(
      `/custom-property-structures/custom-property-structure-items/${customPropertyStructureItemId}`,
      { params: { confirmed } }
    );
    return response.data;
  }

  /**
   * Update custom property structure item
   */
  async updateCustomPropertyStructureItem(
    customPropertyStructureItemId: number,
    data: {
      label?: string;
      description?: string;
      options?: any;
      required?: boolean;
    }
  ): Promise<any> {
    const response = await this.client.patch(
      `/custom-property-structures/custom-property-structure-items/${customPropertyStructureItemId}`,
      data
    );
    return response.data;
  }

  // ============================================
  // Data Stores (Enhanced)
  // ============================================

  /**
   * Delete multiple data stores
   */
  async deleteDataStores(
    teamId: number,
    ids: number[],
    confirmed: boolean = false
  ): Promise<any> {
    const response = await this.client.delete('/data-stores', {
      params: { teamId, confirmed },
      data: { ids }
    });
    return response.data;
  }

  /**
   * Get data store details
   */
  async getDataStore(dataStoreId: number): Promise<any> {
    const response = await this.client.get(`/data-stores/${dataStoreId}`);
    return response.data;
  }

  /**
   * Update data store
   */
  async updateDataStore(
    dataStoreId: number,
    data: {
      name?: string;
      datastructureId?: number;
      maxSizeMB?: number;
    }
  ): Promise<any> {
    const response = await this.client.patch(`/data-stores/${dataStoreId}`, data);
    return response.data;
  }

  // ============================================
  // Scenarios - Consumptions
  // ============================================

  /**
   * List scenario consumptions
   */
  async getScenarioConsumptions(options?: {
    teamId?: number;
    organizationId?: number;
  }): Promise<any> {
    const params: any = {};
    if (options?.teamId) params.teamId = options.teamId;
    if (options?.organizationId) params.organizationId = options.organizationId;

    const response = await this.client.get('/scenarios/consumptions', { params });
    return response.data;
  }

  // ============================================
  // Scenarios - Tools
  // ============================================

  /**
   * Update tool configuration
   */
  async updateTool(scenarioId: number, data: {
    name?: string;
    description?: string;
    inputs?: any[];
    moduleType?: string;
    module?: any;
  }): Promise<any> {
    const response = await this.client.patch(`/scenarios/tools/${scenarioId}`, data);
    return response.data;
  }

  // ============================================
  // Scenarios - Custom Properties Data
  // ============================================

  /**
   * Get custom properties data for scenario
   */
  async getScenarioCustomProperties(scenarioId: number): Promise<any> {
    const response = await this.client.get(`/scenarios/${scenarioId}/custom-properties`);
    return response.data;
  }

  /**
   * Fill in custom properties data (first time)
   */
  async createScenarioCustomProperties(scenarioId: number, data: any): Promise<any> {
    const response = await this.client.post(`/scenarios/${scenarioId}/custom-properties`, data);
    return response.data;
  }

  /**
   * Set custom properties (replace all)
   */
  async setScenarioCustomProperties(scenarioId: number, data: any): Promise<any> {
    const response = await this.client.put(`/scenarios/${scenarioId}/custom-properties`, data);
    return response.data;
  }

  /**
   * Update custom properties (partial update)
   */
  async updateScenarioCustomProperties(scenarioId: number, data: any): Promise<any> {
    const response = await this.client.patch(`/scenarios/${scenarioId}/custom-properties`, data);
    return response.data;
  }

  /**
   * Delete custom properties data
   */
  async deleteScenarioCustomProperties(scenarioId: number, confirmed: boolean = false): Promise<any> {
    const response = await this.client.delete(`/scenarios/${scenarioId}/custom-properties`, {
      params: { confirmed }
    });
    return response.data;
  }

  // ============================================
  // Scenario Folders
  // ============================================

  /**
   * List scenario folders
   */
  async getScenarioFolders(teamId: number): Promise<any> {
    const response = await this.client.get('/scenarios-folders', {
      params: { teamId }
    });
    return response.data;
  }

  /**
   * Create scenario folder
   */
  async createScenarioFolder(name: string, teamId: number): Promise<any> {
    const response = await this.client.post('/scenarios-folders', { name, teamId });
    return response.data;
  }

  /**
   * Delete scenario folder
   */
  async deleteScenarioFolder(folderId: number): Promise<any> {
    const response = await this.client.delete(`/scenarios-folders/${folderId}`);
    return response.data;
  }

  /**
   * Update scenario folder
   */
  async updateScenarioFolder(folderId: number, name: string): Promise<any> {
    const response = await this.client.patch(`/scenarios-folders/${folderId}`, { name });
    return response.data;
  }

  // ============================================
  // SDK Apps
  // ============================================

  /**
   * List SDK apps
   */
  async getSDKApps(all: boolean = false): Promise<any> {
    const response = await this.client.get('/sdk/apps', {
      params: { all }
    });
    return response.data;
  }

  /**
   * Create SDK app
   */
  async createSDKApp(app: any): Promise<any> {
    const response = await this.client.post('/sdk/apps', { app });
    return response.data;
  }

  /**
   * Get SDK app
   */
  async getSDKApp(appName: string, appVersion: number, options?: {
    all?: boolean;
    opensource?: boolean;
  }): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}`, {
      params: options
    });
    return response.data;
  }

  /**
   * Delete SDK app
   */
  async deleteSDKApp(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.delete(`/sdk/apps/${appName}/${appVersion}`);
    return response.data;
  }

  /**
   * Update SDK app
   */
  async updateSDKApp(appName: string, appVersion: number, data: any): Promise<any> {
    const response = await this.client.patch(`/sdk/apps/${appName}/${appVersion}`, data);
    return response.data;
  }

  /**
   * Clone SDK app
   */
  async cloneSDKApp(appName: string, appVersion: number, newName: string, newVersion: number): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/clone`, {
      newName,
      newVersion
    });
    return response.data;
  }

  /**
   * Get SDK app review
   */
  async getSDKAppReview(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/review`);
    return response.data;
  }

  /**
   * Request SDK app review
   */
  async requestSDKAppReview(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/review`);
    return response.data;
  }

  /**
   * Get SDK app review form
   */
  async getSDKAppReviewForm(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/review/form`);
    return response.data;
  }

  /**
   * Submit SDK app review form
   */
  async submitSDKAppReviewForm(appName: string, appVersion: number, data: any): Promise<any> {
    const response = await this.client.put(`/sdk/apps/${appName}/${appVersion}/review/form`, data);
    return response.data;
  }

  /**
   * Get SDK app events log
   */
  async getSDKAppEventsLog(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/events-log`);
    return response.data;
  }

  /**
   * Get SDK app common data (client ID and secret)
   */
  async getSDKAppCommon(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/common`);
    return response.data;
  }

  /**
   * Set SDK app common data
   */
  async setSDKAppCommon(appName: string, appVersion: number, data: any): Promise<any> {
    const response = await this.client.put(`/sdk/apps/${appName}/${appVersion}/common`, data);
    return response.data;
  }

  /**
   * Get SDK app documentation
   */
  async getSDKAppDocs(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/readme`);
    return response.data;
  }

  /**
   * Set SDK app documentation
   */
  async setSDKAppDocs(appName: string, appVersion: number, markdown: string): Promise<any> {
    const response = await this.client.put(`/sdk/apps/${appName}/${appVersion}/readme`, markdown, {
      headers: { 'Content-Type': 'text/markdown' }
    });
    return response.data;
  }

  /**
   * Set SDK app base configuration
   */
  async setSDKAppBase(appName: string, appVersion: number, config: any): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/base`, config, {
      headers: { 'Content-Type': 'application/jsonc' }
    });
    return response.data;
  }

  /**
   * Patch SDK app base configuration
   */
  async patchSDKAppBase(appName: string, appVersion: number, config: any): Promise<any> {
    const response = await this.client.patch(`/sdk/apps/${appName}/${appVersion}/base`, config, {
      headers: { 'Content-Type': 'application/jsonc' }
    });
    return response.data;
  }

  /**
   * Commit SDK app changes
   */
  async commitSDKAppChanges(appName: string, appVersion: number, data: {
    message: string;
    notify?: boolean;
    changeIds?: number[];
  }): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/commit`, data);
    return response.data;
  }

  /**
   * Rollback SDK app changes
   */
  async rollbackSDKAppChanges(appName: string, appVersion: number): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/rollback`);
    return response.data;
  }

  /**
   * Get SDK app logo
   */
  async getSDKAppLogo(appName: string, appVersion: number, size: string): Promise<any> {
    const response = await this.client.get(`/sdk/apps/${appName}/${appVersion}/icon/${size}`);
    return response.data;
  }

  /**
   * Set SDK app logo
   */
  async setSDKAppLogo(appName: string, appVersion: number, icon: any): Promise<any> {
    const response = await this.client.put(`/sdk/apps/${appName}/${appVersion}/icon`, icon, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
    return response.data;
  }

  /**
   * Uninstall SDK app from organization
   */
  async uninstallSDKApp(appName: string, appVersion: number, organizationId: number): Promise<any> {
    const response = await this.client.post(`/sdk/apps/${appName}/${appVersion}/uninstall`, {
      organizationId
    });
    return response.data;
  }
}
