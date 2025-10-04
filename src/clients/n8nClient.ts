import axios, { AxiosInstance } from 'axios';
import { N8nWorkflow } from '../types';

export class N8nClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get('/workflows');
    return response.data.data || response.data;
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/workflows/${workflowId}`);
    return response.data.data || response.data;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
    const response = await this.client.post('/workflows', workflow);
    return response.data.data || response.data;
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/workflows/${workflowId}`, workflow);
    return response.data.data || response.data;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/workflows/${workflowId}`);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: true });
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: false });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, data?: any): Promise<any> {
    const response = await this.client.post(`/workflows/${workflowId}/execute`, { data });
    return response.data;
  }
}
