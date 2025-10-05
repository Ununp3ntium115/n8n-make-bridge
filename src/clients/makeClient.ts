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
}
