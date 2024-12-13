// src/sdk/lib/api.ts
import { ChatOptions, ChatResponse, InitResponse, ApiResponse, OrganizationTheme, ChatMessage } from './types';

// src/sdk/lib/api.ts
export class ApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://www.bots4ed.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || 'An unknown error occurred',
        };
      }

      return { data };
    } catch (error: any) {
      console.error('API Request Error:', error);
      return {
        error: {
          code: error.code || 'REQUEST_FAILED',
          message: error.message || 'Failed to complete the request',
        },
      };
    }
  }

  async initializeChat(
    options: ChatOptions = {}
  ): Promise<ApiResponse<InitResponse>> {
    return this.request<InitResponse>('/api/v1/sdk/chat/init', {
      method: 'POST',
      body: JSON.stringify({
        programId: options.programId,
        metadata: options.metadata,
        domain: window.location.hostname,
      }),
    });
  }

  async sendMessage(
    sessionId: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<ChatResponse> {
    const response = await this.request<ChatResponse>('/api/v1/sdk/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        message,
        metadata,
      }),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }

  async endSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/sdk/chat/${sessionId}/end`, {
      method: 'POST',
    });
  }

  // Add the saveSessionState method
  async saveSessionState(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/sdk/chat/${sessionId}/state`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        lastActive: new Date().toISOString()
      }),
    });
  }

  async validateSession(sessionId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/sdk/chat/${sessionId}/validate`, {
      method: 'GET',
    });
  }

  async getSessionHistory(
    sessionId: string,
    limit: number = 50,
    before?: string
  ): Promise<ApiResponse<{ messages: ChatMessage[] }>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(before && { before }),
    });

    return this.request<{ messages: ChatMessage[] }>(
      `/api/v1/sdk/chat/${sessionId}/history?${params}`,
      {
        method: 'GET',
      }
    );
  }

  async getOrgSettings(apiKey: string): Promise<ApiResponse<{ theme?: OrganizationTheme }>> {
    return this.request<{ theme?: OrganizationTheme }>('/api/v1/sdk/org-settings', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey
      }
    });
  }

  async *streamChat(
    message: string,
    sessionId: string | null | undefined,
    previousMessages: any[],
    metadata?: Record<string, any>
  ): AsyncGenerator<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/sdk/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          message,
          sessionId,
          previousMessages,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              yield data;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
let apiClientInstance: ApiClient | null = null;

export const createApiClient = (apiKey: string, baseUrl?: string) => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(apiKey, baseUrl);
  }
  return apiClientInstance;
};

export const getApiClient = () => {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call createApiClient first.');
  }
  return apiClientInstance;
};
