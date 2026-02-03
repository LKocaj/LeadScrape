/**
 * Enrichment service - orchestrates lead enrichment
 */

import { createLogger } from '../utils/logger.js';
import { findLeads, updateLead, getLeadById } from '../storage/lead.repository.js';
import { scrapeWebsiteForEmails, batchScrapeEmails } from './email-scraper.js';
import type { Lead, LeadStatus } from '../types/index.js';

const logger = createLogger('enrichment-service');

export interface EnrichmentStats {
  total: number;
  enriched: number;
  skipped: number;
  failed: number;
  alreadyHadEmail: number;
  noWebsite: number;
}

export interface EnrichLeadResult {
  leadId: string;
  success: boolean;
  email?: string;
  previousEmail?: string;
  confidence?: number;
  error?: string;
}

/**
 * Enrich a single lead by scraping its website for emails
 */
export async function enrichLead(leadId: string): Promise<EnrichLeadResult> {
  const lead = getLeadById(leadId);

  if (!lead) {
    return {
      leadId,
      success: false,
      error: 'Lead not found',
    };
  }

  // Skip if already has email
  if (lead.email) {
    return {
      leadId,
      success: true,
      email: lead.email,
      previousEmail: lead.email,
    };
  }

  // Skip if no website
  if (!lead.website) {
    return {
      leadId,
      success: false,
      error: 'No website to scrape',
    };
  }

  try {
    const result = await scrapeWebsiteForEmails(lead.website);

    if (!result.success || result.emails.length === 0) {
      return {
        leadId,
        success: false,
        error: result.error || 'No emails found on website',
      };
    }

    // Get the best email (first one after sorting)
    const bestEmail = result.emails[0]!;

    // Update the lead
    updateLead(leadId, {
      email: bestEmail.email,
      status: 'Enriched' as LeadStatus,
      enrichedAt: new Date(),
    });

    logger.info(`Enriched lead ${leadId} with email ${bestEmail.email} (confidence: ${bestEmail.confidence})`);

    return {
      leadId,
      success: true,
      email: bestEmail.email,
      confidence: bestEmail.confidence,
    };
  } catch (err) {
    logger.error(`Failed to enrich lead ${leadId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return {
      leadId,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Enrich multiple leads by their IDs
 */
export async function enrichLeads(
  leadIds: string[],
  onProgress?: (completed: number, total: number, result: EnrichLeadResult) => void
): Promise<{ results: EnrichLeadResult[]; stats: EnrichmentStats }> {
  const results: EnrichLeadResult[] = [];
  const stats: EnrichmentStats = {
    total: leadIds.length,
    enriched: 0,
    skipped: 0,
    failed: 0,
    alreadyHadEmail: 0,
    noWebsite: 0,
  };

  for (let i = 0; i < leadIds.length; i++) {
    const leadId = leadIds[i]!;
    const result = await enrichLead(leadId);
    results.push(result);

    if (result.success) {
      if (result.previousEmail) {
        stats.alreadyHadEmail++;
        stats.skipped++;
      } else {
        stats.enriched++;
      }
    } else if (result.error === 'No website to scrape') {
      stats.noWebsite++;
      stats.skipped++;
    } else {
      stats.failed++;
    }

    if (onProgress) {
      onProgress(i + 1, leadIds.length, result);
    }
  }

  return { results, stats };
}

/**
 * Enrich all leads matching filters that don't have emails
 */
export async function enrichAllLeads(
  options: {
    trade?: string;
    source?: string;
    limit?: number;
  } = {},
  onProgress?: (completed: number, total: number, result: EnrichLeadResult) => void
): Promise<{ results: EnrichLeadResult[]; stats: EnrichmentStats }> {
  // Get leads without emails that have websites
  const leads = findLeads({
    trade: options.trade as Lead['trade'],
    source: options.source as Lead['source'],
    hasEmail: false,
    limit: options.limit || 100,
  });

  // Filter to only those with websites
  const leadsWithWebsites = leads.filter((l: Lead) => l.website);

  logger.info(`Starting enrichment of ${leadsWithWebsites.length} leads (${leads.length - leadsWithWebsites.length} skipped - no website)`);

  const leadIds = leadsWithWebsites.map((l: Lead) => l.id);
  const result = await enrichLeads(leadIds, onProgress);

  // Add skipped count for leads without websites
  result.stats.noWebsite = leads.length - leadsWithWebsites.length;
  result.stats.skipped += result.stats.noWebsite;
  result.stats.total = leads.length;

  logger.info(`Enrichment complete: ${result.stats.enriched} enriched, ${result.stats.failed} failed, ${result.stats.skipped} skipped`);

  return result;
}

/**
 * Get enrichment status summary
 */
export function getEnrichmentStatus(): {
  totalLeads: number;
  withEmail: number;
  withoutEmail: number;
  withWebsite: number;
  enrichable: number; // Has website but no email
} {
  const allLeads = findLeads({ limit: 10000 });

  const withEmail = allLeads.filter((l: Lead) => l.email).length;
  const withWebsite = allLeads.filter((l: Lead) => l.website).length;
  const enrichable = allLeads.filter((l: Lead) => l.website && !l.email).length;

  return {
    totalLeads: allLeads.length,
    withEmail,
    withoutEmail: allLeads.length - withEmail,
    withWebsite,
    enrichable,
  };
}
