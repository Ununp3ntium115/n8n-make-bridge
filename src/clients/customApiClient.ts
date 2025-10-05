import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Generic API Client for custom API integrations
 * Supports services like Hostinger, Vultr, Linode, etc.
 */
export class CustomApiClient {
  private client: AxiosInstance;
  private serviceName: string;

  constructor(
    baseUrl: string,
    apiToken: string,
    authType: 'bearer' | 'api-key' | 'custom' = 'bearer',
    customHeaders: Record<string, string> = {}
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // Add authentication header based on type
    if (authType === 'bearer') {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else if (authType === 'api-key') {
      headers['X-API-Key'] = apiToken;
    }

    this.client = axios.create({
      baseURL: baseUrl,
      headers,
    });

    this.serviceName = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put(endpoint, data);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.patch(endpoint, data);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await this.client.delete(endpoint);
    return response.data;
  }

  /**
   * Make a custom request with full control
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request(config);
    return response.data;
  }
}

/**
 * Hostinger VPS API Client
 */
export class HostingerClient extends CustomApiClient {
  constructor(apiToken: string) {
    super(
      'https://developers.hostinger.com/api/vps/v1',
      apiToken,
      'bearer'
    );
  }

  /**
   * List all virtual machines
   */
  async listVirtualMachines() {
    return this.get('/virtual-machines');
  }

  /**
   * Get a specific virtual machine
   */
  async getVirtualMachine(vmId: string) {
    return this.get(`/virtual-machines/${vmId}`);
  }

  /**
   * Start a virtual machine
   */
  async startVirtualMachine(vmId: string) {
    return this.post(`/virtual-machines/${vmId}/start`);
  }

  /**
   * Stop a virtual machine
   */
  async stopVirtualMachine(vmId: string) {
    return this.post(`/virtual-machines/${vmId}/stop`);
  }

  /**
   * Reboot a virtual machine
   */
  async rebootVirtualMachine(vmId: string) {
    return this.post(`/virtual-machines/${vmId}/reboot`);
  }
}

/**
 * Create a custom API client for any service
 */
export function createCustomClient(
  serviceName: string,
  apiToken: string,
  baseUrl?: string,
  authType: 'bearer' | 'api-key' | 'custom' = 'bearer'
): CustomApiClient {
  // Use service-specific base URL if provided
  const url = baseUrl || `https://api.${serviceName}.com`;

  return new CustomApiClient(url, apiToken, authType);
}
