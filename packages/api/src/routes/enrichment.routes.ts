/**
 * Enrichment routes - handle email scraping and lead enrichment
 */

import { Router } from 'express';
import {
  enrichLead,
  enrichLeads,
  enrichAllLeads,
  getEnrichmentStatus,
} from '../../../../src/enrichment/enrichment.service.js';

export const enrichmentRouter = Router();

/**
 * GET /api/enrichment/status
 * Get enrichment status summary
 */
enrichmentRouter.get('/status', (_req, res) => {
  try {
    const status = getEnrichmentStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to get enrichment status',
    });
  }
});

/**
 * POST /api/enrichment/lead/:id
 * Enrich a single lead by ID
 */
enrichmentRouter.post('/lead/:id', async (req, res): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: 'Lead ID is required',
    });
    return;
  }

  try {
    const result = await enrichLead(id);

    if (result.success) {
      res.json({
        success: true,
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        data: result,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Enrichment failed',
    });
  }
});

/**
 * POST /api/enrichment/batch
 * Enrich multiple leads by IDs
 */
enrichmentRouter.post('/batch', async (req, res): Promise<void> => {
  const { leadIds } = req.body;

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    res.status(400).json({
      success: false,
      error: 'leadIds array is required',
    });
    return;
  }

  // Limit batch size
  if (leadIds.length > 50) {
    res.status(400).json({
      success: false,
      error: 'Maximum batch size is 50 leads. Use multiple requests for larger batches.',
    });
    return;
  }

  try {
    const { results, stats } = await enrichLeads(leadIds);

    res.json({
      success: true,
      data: {
        stats,
        results,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Batch enrichment failed',
    });
  }
});

/**
 * POST /api/enrichment/all
 * Enrich all leads matching criteria
 */
enrichmentRouter.post('/all', async (req, res): Promise<void> => {
  const { trade, source, limit = 50 } = req.body;

  // Limit to prevent long-running requests
  const effectiveLimit = Math.min(limit, 100);

  try {
    const { results, stats } = await enrichAllLeads({
      trade,
      source,
      limit: effectiveLimit,
    });

    res.json({
      success: true,
      data: {
        stats,
        results,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Enrichment failed',
    });
  }
});
