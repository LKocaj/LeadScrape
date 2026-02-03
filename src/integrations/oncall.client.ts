/**
 * OnCall Automation Lead Intake Integration
 * Pushes scraped leads to the OnCall lead-intake-system
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { Lead } from '../types/lead.types.js';
import { nanoid } from 'nanoid';

interface OnCallConfig {
  apiUrl: string;
  tenantId: string;
  apiKey: string;
}

interface IntakePayload {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  message: string | null;
  utm: Record<string, string>;
  data: Record<string, unknown>;
}

interface IntakeResponse {
  lead_id: string;
  idempotency_key: string;
  status: string;
}

interface PushResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

export class OnCallClient {
  private config: OnCallConfig;
  private log = logger.child({ module: 'oncall-client' });

  constructor(configOverride?: Partial<OnCallConfig>) {
    this.config = {
      apiUrl: configOverride?.apiUrl || config.ONCALL_API_URL || '',
      tenantId: configOverride?.tenantId || config.ONCALL_TENANT_ID || '',
      apiKey: configOverride?.apiKey || config.ONCALL_API_KEY || '',
    };
  }

  isConfigured(): boolean {
    return !!(this.config.apiUrl && this.config.tenantId && this.config.apiKey);
  }

  async pushLead(lead: Lead): Promise<PushResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'OnCall integration not configured' };
    }

    const idempotencyKey = `leadscrape-${lead.id}`;

    const payload: IntakePayload = {
      full_name: lead.contactName ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      source: `LeadScrape:${lead.source}`,
      message: `Trade: ${lead.trade}\nCompany: ${lead.companyName}\nAddress: ${lead.address || 'N/A'}\nRating: ${lead.rating || 'N/A'}\nWebsite: ${lead.website || 'N/A'}`,
      utm: {
        source: 'leadscrape',
        medium: 'scraper',
        campaign: lead.trade.toLowerCase(),
      },
      data: {
        leadscrape_id: lead.id,
        company_name: lead.companyName,
        trade: lead.trade,
        original_source: lead.source,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip: lead.zipCode,
        website: lead.website,
        rating: lead.rating,
        review_count: lead.reviewCount,
        scraped_at: lead.scrapedAt,
      },
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': this.config.tenantId,
          'X-API-Key': this.config.apiKey,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.log.error(`OnCall API error: ${response.status} - ${errorText}`);
        return { success: false, error: `API error: ${response.status}` };
      }

      const result = (await response.json()) as IntakeResponse;
      this.log.info(`Pushed lead to OnCall: ${result.lead_id}`);

      return { success: true, leadId: result.lead_id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log.error(`Failed to push lead to OnCall: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  async pushLeads(leads: Lead[]): Promise<{ total: number; success: number; failed: number; results: PushResult[] }> {
    const results: PushResult[] = [];
    let success = 0;
    let failed = 0;

    for (const lead of leads) {
      const result = await this.pushLead(lead);
      results.push(result);

      if (result.success) {
        success++;
      } else {
        failed++;
      }

      // Rate limit: 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { total: leads.length, success, failed, results };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { connected: false, message: 'OnCall integration not configured. Set ONCALL_API_URL, ONCALL_TENANT_ID, and ONCALL_API_KEY in .env' };
    }

    try {
      // Try to hit the health endpoint
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'X-Tenant-Id': this.config.tenantId,
          'X-API-Key': this.config.apiKey,
        },
      });

      if (response.ok) {
        return { connected: true, message: 'Connected to OnCall lead-intake-system' };
      } else {
        return { connected: false, message: `Connection failed: ${response.status}` };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { connected: false, message: `Connection error: ${errorMessage}` };
    }
  }
}

export const oncallClient = new OnCallClient();
