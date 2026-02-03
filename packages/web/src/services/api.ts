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
  ImportUploadResult,
  ImportFieldsResponse,
  ImportPreviewResult,
  ImportConfig,
  ImportResult,
  AnalyticsOverview,
  TimelineData,
  SourceMetrics,
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
    const qs = buildQueryString(filters as Record<string, string | number | boolean | undefined> || {});
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
    const qs = buildQueryString(filters as Record<string, string | number | boolean | undefined> || {});
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

  // Import
  async uploadImportFile(file: File): Promise<ApiResponse<ImportUploadResult>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/import/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },

  async getImportFields(): Promise<ApiResponse<ImportFieldsResponse>> {
    return request('/import/fields');
  },

  async previewImport(
    fileId: string,
    columnMapping: Record<string, string>,
    limit?: number
  ): Promise<ApiResponse<ImportPreviewResult>> {
    return request('/import/preview', {
      method: 'POST',
      body: JSON.stringify({ fileId, columnMapping, limit }),
    });
  },

  async executeImport(config: ImportConfig): Promise<ApiResponse<ImportResult>> {
    return request('/import/execute', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  getImportTemplateUrl(format: 'csv' | 'xlsx'): string {
    return `${API_BASE}/import/template/${format}`;
  },

  // Analytics
  async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    return request('/analytics/overview');
  },

  async getAnalyticsTimeline(
    days?: number,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<ApiResponse<{ timeline: TimelineData[]; startDate: string; endDate: string; groupBy: string }>> {
    const qs = buildQueryString({ days, groupBy });
    return request(`/analytics/timeline${qs}`);
  },

  async getAnalyticsSources(): Promise<ApiResponse<{ sources: SourceMetrics[] }>> {
    return request('/analytics/sources');
  },

  async getAnalyticsActivity(days?: number): Promise<ApiResponse<{ activity: TimelineData[]; days: number }>> {
    const qs = buildQueryString({ days });
    return request(`/analytics/activity${qs}`);
  },

  // Enrichment
  async getEnrichmentStatus(): Promise<ApiResponse<{
    totalLeads: number;
    withEmail: number;
    withoutEmail: number;
    withWebsite: number;
    enrichable: number;
  }>> {
    return request('/enrichment/status');
  },

  async enrichLead(leadId: string): Promise<ApiResponse<{
    leadId: string;
    success: boolean;
    email?: string;
    confidence?: number;
    error?: string;
  }>> {
    return request(`/enrichment/lead/${leadId}`, {
      method: 'POST',
    });
  },

  async enrichBatch(leadIds: string[]): Promise<ApiResponse<{
    stats: {
      total: number;
      enriched: number;
      skipped: number;
      failed: number;
      alreadyHadEmail: number;
      noWebsite: number;
    };
    results: Array<{
      leadId: string;
      success: boolean;
      email?: string;
      error?: string;
    }>;
  }>> {
    return request('/enrichment/batch', {
      method: 'POST',
      body: JSON.stringify({ leadIds }),
    });
  },

  async enrichAll(options?: {
    trade?: string;
    source?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    stats: {
      total: number;
      enriched: number;
      skipped: number;
      failed: number;
      alreadyHadEmail: number;
      noWebsite: number;
    };
    results: Array<{
      leadId: string;
      success: boolean;
      email?: string;
      error?: string;
    }>;
  }>> {
    return request('/enrichment/all', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },
};
