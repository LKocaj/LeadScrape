import type {
  Lead,
  LeadFilters,
  Stats,
  ApiResponse,
  ScrapeRequest,
  ScrapeResult,
  ExportResult,
  LeadSource,
  Trade,
  LeadStatus,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // Leads
  async getLeads(filters?: LeadFilters): Promise<ApiResponse<Lead[]>> {
    const qs = buildQueryString(filters || {});
    return request(`/leads${qs}`);
  },

  async getLead(id: string): Promise<ApiResponse<Lead>> {
    return request(`/leads/${id}`);
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return request(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: string): Promise<ApiResponse<null>> {
    return request(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Stats
  async getStats(): Promise<ApiResponse<Stats>> {
    return request('/stats');
  },

  // Scrape
  async startScrape(options: ScrapeRequest): Promise<ApiResponse<ScrapeResult>> {
    return request('/scrape', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  async getAvailableSources(): Promise<ApiResponse<LeadSource[]>> {
    return request('/scrape/sources');
  },

  // Export
  async exportXlsx(filters?: LeadFilters): Promise<ApiResponse<ExportResult>> {
    return request('/export/xlsx', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },

  async exportCsv(filters?: LeadFilters): Promise<ApiResponse<ExportResult>> {
    return request('/export/csv', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },

  async exportInstantly(filters?: LeadFilters): Promise<ApiResponse<ExportResult & { skipped: number }>> {
    return request('/export/instantly', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },

  async getExportPreview(filters?: LeadFilters): Promise<ApiResponse<{ count: number }>> {
    const qs = buildQueryString(filters || {});
    return request(`/export/preview${qs}`);
  },

  // Enums
  async getEnums(): Promise<ApiResponse<{ trades: Trade[]; sources: LeadSource[]; statuses: LeadStatus[] }>> {
    return request('/enums');
  },

  // OnCall Integration
  async getOnCallStatus(): Promise<ApiResponse<{ connected: boolean; message: string }>> {
    return request('/oncall/status');
  },

  async pushToOnCall(leadId: string): Promise<ApiResponse<{ success: boolean; leadId?: string; error?: string }>> {
    return request(`/oncall/push/${leadId}`, {
      method: 'POST',
    });
  },

  async pushBulkToOnCall(leadIds: string[]): Promise<ApiResponse<{ total: number; success: number; failed: number }>> {
    return request('/oncall/push-bulk', {
      method: 'POST',
      body: JSON.stringify({ leadIds }),
    });
  },

  async pushAllToOnCall(filters?: { status?: string; trade?: string; source?: string }): Promise<ApiResponse<{ total: number; success: number; failed: number }>> {
    return request('/oncall/push-all', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    });
  },
};
