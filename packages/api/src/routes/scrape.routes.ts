import { Router } from 'express';
import { runScrape, getScrapableSources } from '../../../../src/orchestrator/scrape.orchestrator.js';
import type { Trade, LeadSource } from '../../../../src/types/index.js';

export const scrapeRouter = Router();

interface ScrapeRequest {
  sources: LeadSource[];
  trades: Trade[];
  location: {
    city?: string;
    county?: string;
    state?: string;
    zipCode?: string;
  };
  maxResultsPerSource?: number;
  skipDeduplication?: boolean;
}

// POST /api/scrape - Start a new scrape
scrapeRouter.post('/', async (req, res): Promise<void> => {
  const body = req.body as ScrapeRequest;

  if (!body.sources || !body.sources.length) {
    res.status(400).json({
      success: false,
      error: 'At least one source is required',
    });
    return;
  }

  if (!body.trades || !body.trades.length) {
    res.status(400).json({
      success: false,
      error: 'At least one trade is required',
    });
    return;
  }

  if (!body.location) {
    res.status(400).json({
      success: false,
      error: 'Location is required',
    });
    return;
  }

  const result = await runScrape({
    sources: body.sources,
    trades: body.trades,
    location: body.location,
    maxResultsPerSource: body.maxResultsPerSource || 100,
    skipDeduplication: body.skipDeduplication || false,
  });

  res.json({
    success: true,
    data: result,
  });
});

// GET /api/scrape/sources - Get available sources
scrapeRouter.get('/sources', (_req, res) => {
  const sources = getScrapableSources();

  res.json({
    success: true,
    data: sources,
  });
});
