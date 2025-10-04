import axios, { AxiosInstance } from 'axios';
import { MakeScenario, MakeBlueprint } from '../types';

export class MakeClient {
  private client: AxiosInstance;
  private region: string;

  constructor(apiToken: string, region: string = 'eu1') {
    this.region = region;
    this.client = axios.create({
      baseURL: `https://${region}.make.com/api/v2`,
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
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
}
