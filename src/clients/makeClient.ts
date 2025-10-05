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
}
